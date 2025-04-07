import { getEvents, getRangeDates } from "./dates.js";
import { Layout, type CalendarSettings } from "./settings.js";
import { drawDateTile, type TileClickHandler } from "./tile.js";
import { ROW_LABEL_CLASS, ROW_LABEL_GAP, rowLabel } from "./labels.js";

export type { TileClickEvent, TileClickHandler } from "./tile.js";

const SVG_NS = "http://www.w3.org/2000/svg";
export const CONTAINER_CLASS = "DayTilesContainer";

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

  svgElement.classList.add(CONTAINER_CLASS);
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
