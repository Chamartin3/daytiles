import { getColor, getClasses } from "./colors.js";
import { getDateContext, getRangeDates, isSpecialDate } from "./dates.js";
import { showDateTooltip, hideDateTooltip } from "./tooltip.js";

const SVG_NS = "http://www.w3.org/2000/svg";

export function drawDateSquare(
  dateToDraw,
  { x, y, size, overwrites, colorSettings },
) {
  const dateContext = getDateContext(dateToDraw);
  const square = document.createElementNS(SVG_NS, "rect");
  const dayColor = overwrites.color || getColor(dateContext, colorSettings);
  const dayClasses = getClasses(dateContext);
  const note = overwrites.note || dateToDraw.toDateString();

  square.setAttribute("x", x);
  square.setAttribute("y", y);
  square.setAttribute("width", size);
  square.setAttribute("height", size);
  square.setAttribute("fill", dayColor);
  if (dateContext.isPast && colorSettings.fadePastDates) {
    const opacity =
      typeof colorSettings.fadePastDates === "number"
        ? colorSettings.fadePastDates
        : 0.4;
    square.setAttribute("fill-opacity", opacity);
  }
  square.setAttribute("data-date", note);
  square.addEventListener("mouseover", showDateTooltip);
  square.addEventListener("mouseout", hideDateTooltip);
  dayClasses.forEach((c) => square.classList.add(c));

  return square;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function isoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function rowLabel(layout, date, rowIndex, daysPerRow) {
  switch (layout) {
    case "month":
      return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
    case "week":
      return `W${isoWeek(date)}`;
    case "weekday":
      return DAY_NAMES[date.getDay()];
    case "custom":
      return `${rowIndex * daysPerRow + 1}`;
    default:
      return "";
  }
}

export function drawCalendar(svgElement, settings) {
  const {
    layout = "month",
    daysPerRow = 28,
    daySize: squareSize,
    gap,
    startDayOfWeek = 1,
    showLabels = false,
    labelWidth = 56,
    specialDates,
    startDate: begin,
    endDate: end,
    year,
    colors: colorSettings,
  } = settings;

  svgElement.innerHTML = "";
  const { startDate, endDate } = getRangeDates(begin, end, year);
  let currentDate = new Date(startDate);
  let row = 0;
  let col = 0;
  let dayIndex = 0;

  const adjustedColumn = (date) => (7 + date.getDay() - startDayOfWeek) % 7;

  const cells = [];
  const labels = [];
  const labeledRows = new Set();

  while (currentDate <= endDate) {
    let newRow = false;

    switch (layout) {
      case "week":
        col = adjustedColumn(currentDate);
        newRow = col === 0 && currentDate > startDate;
        break;
      case "weekday":
        row = adjustedColumn(currentDate);
        newRow = true;
        if (row == 0) col++;
        break;
      case "month":
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
      case "custom":
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
      el.setAttribute("x", 0);
      el.setAttribute("y", r * (squareSize + gap) + squareSize * 0.7);
      el.setAttribute("class", "row-label");
      el.textContent = text;
      svgElement.appendChild(el);
      return el;
    });
    let maxWidth = labelWidth;
    for (const el of labelEls) {
      const w = el.getBBox().width;
      if (w > maxWidth) maxWidth = w;
    }
    offsetX = maxWidth + 8;
  }

  for (const { date, row: r, col: c } of cells) {
    svgElement.appendChild(
      drawDateSquare(date, {
        x: offsetX + c * (squareSize + gap),
        y: r * (squareSize + gap),
        size: squareSize,
        overwrites: isSpecialDate(date, specialDates),
        colorSettings,
      }),
    );
  }
}
