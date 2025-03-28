import { getColor, getClasses, type ColorSettings } from "./colors.js";
import {
  getDateContext,
  getRangeDates,
  getEvent,
  type EventInfo,
} from "./dates.js";
import { Layout, type CalendarSettings } from "./settings.js";
import { Shape, createTile } from "./shapes.js";
import { showDateTooltip, hideDateTooltip } from "./tooltip.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const DEFAULT_FADE_BRIGHTNESS = 0.6;
const ROW_LABEL_CLASS = "row-label";
const ROW_LABEL_GAP = 8;

export interface TileClickEvent {
  date: Date;
  event: EventInfo;
  domEvent: MouseEvent;
}

export type TileClickHandler = (e: TileClickEvent) => void;

interface TileOptions {
  x: number;
  y: number;
  size: number;
  shape: Shape;
  overwrites: EventInfo;
  colorSettings: ColorSettings;
  onClick?: TileClickHandler;
}

export function drawDateTile(
  dateToDraw: Date,
  { x, y, size, shape, overwrites, colorSettings, onClick }: TileOptions,
): SVGElement {
  const dateContext = getDateContext(dateToDraw);
  const tile = createTile(shape, x, y, size);
  const dayColor = overwrites.color || getColor(dateContext, colorSettings);
  const dayClasses = getClasses(dateContext);

  tile.setAttribute("fill", dayColor);
  if (
    dateContext.isPast &&
    !dateContext.isPresent &&
    colorSettings.fadePastDates
  ) {
    const brightness =
      typeof colorSettings.fadePastDates === "number"
        ? colorSettings.fadePastDates
        : DEFAULT_FADE_BRIGHTNESS;
    tile.style.filter = `brightness(${brightness})`;
  }
  tile.setAttribute("data-date", dateToDraw.toDateString());
  if (overwrites.note) tile.setAttribute("data-note", overwrites.note);
  tile.addEventListener("mouseover", showDateTooltip);
  tile.addEventListener("mouseout", hideDateTooltip);
  if (onClick) {
    tile.style.cursor = "pointer";
    tile.addEventListener("click", (domEvent) => {
      onClick({ date: new Date(dateToDraw), event: overwrites, domEvent });
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

  for (const { date, row: r, col: c } of cells) {
    svgElement.appendChild(
      drawDateTile(date, {
        x: offsetX + c * (squareSize + gap),
        y: r * (squareSize + gap),
        size: squareSize,
        shape,
        overwrites: getEvent(date, events),
        colorSettings,
        onClick: onTileClick,
      }),
    );
  }
}
