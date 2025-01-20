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
  square.setAttribute("data-date", note);
  square.addEventListener("mouseover", showDateTooltip);
  square.addEventListener("mouseout", hideDateTooltip);
  dayClasses.forEach((c) => square.classList.add(c));

  return square;
}

export function drawCalendar(svgElement, settings) {
  const {
    layout = "month",
    daysPerRow = 28,
    daySize: squareSize,
    gap,
    startDayOfWeek = 1,
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

    const displayConfig = {
      x: col * (squareSize + gap),
      y: row * (squareSize + gap),
      size: squareSize,
      overwrites: isSpecialDate(currentDate, specialDates),
      colorSettings,
    };

    svgElement.appendChild(drawDateSquare(currentDate, displayConfig));
    currentDate.setDate(currentDate.getDate() + 1);
  }
}
