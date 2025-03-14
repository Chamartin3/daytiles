import { getColor, getClasses } from "./colors.js";
import { getDateContext, getRangeDates, getEvent, } from "./dates.js";
import { Layout } from "./settings.js";
import { showDateTooltip, hideDateTooltip } from "./tooltip.js";
const SVG_NS = "http://www.w3.org/2000/svg";
const DEFAULT_FADE_BRIGHTNESS = 0.6;
const ROW_LABEL_CLASS = "row-label";
const ROW_LABEL_GAP = 8;
export function drawDateSquare(dateToDraw, { x, y, size, overwrites, colorSettings }) {
    const dateContext = getDateContext(dateToDraw);
    const square = document.createElementNS(SVG_NS, "rect");
    const dayColor = overwrites.color || getColor(dateContext, colorSettings);
    const dayClasses = getClasses(dateContext);
    square.setAttribute("x", String(x));
    square.setAttribute("y", String(y));
    square.setAttribute("width", String(size));
    square.setAttribute("height", String(size));
    square.setAttribute("fill", dayColor);
    if (dateContext.isPast &&
        !dateContext.isPresent &&
        colorSettings.fadePastDates) {
        const brightness = typeof colorSettings.fadePastDates === "number"
            ? colorSettings.fadePastDates
            : DEFAULT_FADE_BRIGHTNESS;
        square.style.filter = `brightness(${brightness})`;
    }
    square.setAttribute("data-date", dateToDraw.toDateString());
    if (overwrites.note)
        square.setAttribute("data-note", overwrites.note);
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
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
function rowLabel(layout, date, rowIndex, daysPerRow) {
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
export function drawCalendar(svgElement, settings) {
    const { layout, daysPerRow, daySize: squareSize, gap, startDayOfWeek, showLabels, labelWidth, events, startDate: begin, endDate: end, year, colors: colorSettings, } = settings;
    svgElement.innerHTML = "";
    const { startDate, endDate } = getRangeDates(begin, end, year);
    const currentDate = new Date(startDate);
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
            case Layout.Week:
                col = adjustedColumn(currentDate);
                newRow = col === 0 && currentDate > startDate;
                break;
            case Layout.Weekday:
                row = adjustedColumn(currentDate);
                newRow = true;
                if (row === 0)
                    col++;
                break;
            case Layout.Month:
                if (currentDate.getDate() === 1 ||
                    currentDate.getTime() === startDate.getTime()) {
                    col = adjustedColumn(currentDate);
                    newRow = true;
                }
                else {
                    col++;
                }
                break;
            case Layout.Custom:
                col = dayIndex % daysPerRow;
                newRow = col === 0 && dayIndex !== 0;
                dayIndex++;
                break;
        }
        if (newRow)
            row++;
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
            el.textContent = text;
            svgElement.appendChild(el);
            return el;
        });
        let maxWidth = labelWidth;
        for (const el of labelEls) {
            const w = el.getBBox().width;
            if (w > maxWidth)
                maxWidth = w;
        }
        offsetX = maxWidth + ROW_LABEL_GAP;
    }
    for (const { date, row: r, col: c } of cells) {
        svgElement.appendChild(drawDateSquare(date, {
            x: offsetX + c * (squareSize + gap),
            y: r * (squareSize + gap),
            size: squareSize,
            overwrites: getEvent(date, events),
            colorSettings,
        }));
    }
}
//# sourceMappingURL=draw.js.map