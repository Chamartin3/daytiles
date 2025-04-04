import { getColor, getClasses, lerpHex, type ColorSettings } from "./colors.js";
import {
  getDateContext,
  getRangeDates,
  getEvents,
  type EventInfo,
} from "./dates.js";
import { Layout, type CalendarSettings } from "./settings.js";
import { Shape, createTile } from "./shapes.js";
import { showDateTooltip, hideDateTooltip } from "./tooltip.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const ROW_LABEL_CLASS = "row-label";
const ROW_LABEL_GAP = 8;

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
  const totalWeight = sumWeights(events);
  if (events.length > 0 && totalWeight !== events.length) {
    tile.setAttribute("data-weight", String(totalWeight));
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

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function rowLabel(
  layout: Layout,
  date: Date,
  rowIndex: number,
  daysPerRow: number,
): string {
  switch (layout) {
    case Layout.Month:
      return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
    case Layout.Week:
      return `W${isoWeek(date)}`;
    case Layout.Weekday:
      return DAY_NAMES[date.getDay()] ?? "";
    case Layout.Custom:
      return `${rowIndex * daysPerRow + 1}`;
    default:
      return "";
  }
}

interface CellPlacement {
  date: Date;
  row: number;
  col: number;
}

export function drawCalendar(
  svgElement: SVGSVGElement,
  settings: CalendarSettings,
  onTileClick?: TileClickHandler,
): void {
  const {
    layout,
    daysPerRow,
    daySize: squareSize,
    gap,
    startDayOfWeek,
    showLabels,
    labelWidth,
    shape,
    events,
    startDate: begin,
    endDate: end,
    year,
    colors: colorSettings,
  } = settings;

  svgElement.innerHTML = "";
  const { startDate, endDate } = getRangeDates(begin, end, year);
  const currentDate = new Date(startDate);
  let row = 0;
  let col = 0;
  let dayIndex = 0;

  const adjustedColumn = (date: Date) =>
    (7 + date.getDay() - startDayOfWeek) % 7;

  const cells: CellPlacement[] = [];
  const labels: { row: number; text: string }[] = [];
  const labeledRows = new Set<number>();

  while (currentDate <= endDate) {
    let newRow = false;

    switch (layout) {
      case Layout.Week:
        col = adjustedColumn(currentDate);
        newRow = col === 0 && currentDate > startDate;
        break;
      case Layout.Weekday:
        row = adjustedColumn(currentDate);
        newRow = true;
        if (row === 0) col++;
        break;
      case Layout.Month:
        if (
          currentDate.getDate() === 1 ||
          currentDate.getTime() === startDate.getTime()
        ) {
          col = adjustedColumn(currentDate);
          newRow = true;
        } else {
          col++;
        }
        break;
      case Layout.Custom:
        col = dayIndex % daysPerRow;
        newRow = col === 0 && dayIndex !== 0;
        dayIndex++;
        break;
    }

    if (newRow) row++;

    if (showLabels && !labeledRows.has(row)) {
      labeledRows.add(row);
      labels.push({
        row,
        text: rowLabel(layout, currentDate, row, daysPerRow),
      });
    }

    cells.push({ date: new Date(currentDate), row, col });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  let offsetX = 0;
  if (showLabels) {
    const labelEls = labels.map(({ row: r, text }) => {
      const el = document.createElementNS(SVG_NS, "text");
      el.setAttribute("x", "0");
      el.setAttribute("y", String(r * (squareSize + gap) + squareSize * 0.7));
      el.setAttribute("class", ROW_LABEL_CLASS);
      el.setAttribute("font-size", String(Math.max(8, Math.round(squareSize * 0.55))));
      el.textContent = text;
      svgElement.appendChild(el);
      return el;
    });
    let maxWidth = labelWidth;
    for (const el of labelEls) {
      const w = el.getBBox().width;
      if (w > maxWidth) maxWidth = w;
    }
    offsetX = maxWidth + ROW_LABEL_GAP;
  }

  let maxWeight = 0;
  for (const { date } of cells) {
    const list = getEvents(date, events);
    let w = 0;
    for (const e of list) w += e.weight ?? 1;
    if (w > maxWeight) maxWeight = w;
  }

  for (const { date, row: r, col: c } of cells) {
    svgElement.appendChild(
      drawDateTile(date, {
        x: offsetX + c * (squareSize + gap),
        y: r * (squareSize + gap),
        size: squareSize,
        shape,
        events: getEvents(date, events),
        colorSettings,
        maxWeight,
        onClick: onTileClick,
      }),
    );
  }
}
