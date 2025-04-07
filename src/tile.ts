import { getColor, getClasses, lerpHex, type ColorSettings } from "./colors.js";
import { getDateContext, type EventInfo } from "./dates.js";
import { Shape, createTile } from "./shapes.js";
import { showDateTooltip, hideDateTooltip } from "./tooltip.js";

export interface TileClickEvent {
  date: Date;
  events: EventInfo[];
  domEvent: MouseEvent;
}

export type TileClickHandler = (e: TileClickEvent) => void;

interface TileOptions {
  x: number;
  y: number;
  size: number;
  shape: Shape;
  events: EventInfo[];
  colorSettings: ColorSettings;
  maxWeight: number;
  onClick?: TileClickHandler;
}

function sumWeights(events: EventInfo[]): number {
  let total = 0;
  for (const e of events) total += e.weight ?? 1;
  return total;
}

function dominantTypeCount(events: EventInfo[]): { type: string | undefined; count: number } {
  const counts = new Map<string | undefined, number>();
  for (const e of events) counts.set(e.type, (counts.get(e.type) ?? 0) + 1);
  let dom: string | undefined;
  let max = 0;
  for (const [t, c] of counts) {
    if (c > max) {
      max = c;
      dom = t;
    }
  }
  return { type: dom, count: max };
}

function resolveTileFill(
  events: EventInfo[],
  baseColor: string,
  colorSettings: ColorSettings,
  maxWeight: number,
): string {
  if (events.length === 0) return baseColor;
  const typeColors = colorSettings.eventTypeColors ?? {};
  if (!colorSettings.heatmap) {
    const first = events[0]!;
    return (
      first.color ||
      (first.type ? typeColors[first.type] : undefined) ||
      colorSettings.defaultEventColor
    );
  }
  const { type } = dominantTypeCount(events);
  const typeColor =
    (type ? typeColors[type] : undefined) ?? colorSettings.defaultEventColor;
  const low = colorSettings.heatmapLow ?? 0.2;
  const high = colorSettings.heatmapHigh ?? 0.35;
  const lowEnd = lerpHex("#ffffff", typeColor, low);
  const highEnd = lerpHex(typeColor, "#000000", high);
  const w = sumWeights(events);
  const t = maxWeight > 1 ? (w - 1) / (maxWeight - 1) : 1;
  return lerpHex(lowEnd, highEnd, t);
}

export function totalWeight(events: EventInfo[]): number {
  return sumWeights(events);
}

export function drawDateTile(
  dateToDraw: Date,
  { x, y, size, shape, events, colorSettings, maxWeight, onClick }: TileOptions,
): SVGElement {
  const dateContext = getDateContext(dateToDraw);
  const tile = createTile(shape, x, y, size);
  const baseColor = getColor(dateContext, colorSettings);
  const dayColor = resolveTileFill(events, baseColor, colorSettings, maxWeight);
  const dayClasses = getClasses(dateContext);

  tile.setAttribute("fill", dayColor);
  const fade =
    dateContext.isPresent
      ? undefined
      : dateContext.isPast
        ? colorSettings.pastFade
        : colorSettings.futureFade;
  if (typeof fade === "number" && fade !== 1) {
    tile.style.filter = `brightness(${fade})`;
  }
  tile.setAttribute("data-date", dateToDraw.toDateString());
  const joinedNote = events
    .map((e) => e.note)
    .filter((n): n is string => Boolean(n))
    .join(" • ");
  if (joinedNote) tile.setAttribute("data-note", joinedNote);
  if (events.length > 1) tile.setAttribute("data-count", String(events.length));
  const total = sumWeights(events);
  if (events.length > 0 && total !== events.length) {
    tile.setAttribute("data-weight", String(total));
  }
  tile.addEventListener("mouseover", showDateTooltip);
  tile.addEventListener("mouseout", hideDateTooltip);
  if (onClick) {
    tile.style.cursor = "pointer";
    tile.addEventListener("click", (domEvent) => {
      onClick({ date: new Date(dateToDraw), events, domEvent });
    });
  }
  dayClasses.forEach((c) => tile.classList.add(c));

  return tile;
}
