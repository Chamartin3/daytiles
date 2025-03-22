import { Daytiles, Layout, Shape, AlternationMode } from "../../dist/index.js";

const UPRISING = "#d62728";
const DOCUMENT = "#1f77b4";
const TERROR = "#2c3e50";
const REGIME = "#ff9500";

const EVENTS = [
  { date: "1789-05-05", color: DOCUMENT, note: "Estates-General opens" },
  { date: "1789-06-17", color: DOCUMENT, note: "Tennis Court Oath" },
  { date: "1789-07-14", color: UPRISING, note: "Storming of the Bastille" },
  { date: "1789-08-26", color: DOCUMENT, note: "Declaration of the Rights of Man" },
  { date: "1789-10-05", color: UPRISING, note: "Women's March on Versailles" },
  { date: "1791-06-21", color: REGIME, note: "Flight to Varennes" },
  { date: "1792-08-10", color: UPRISING, note: "Storming of the Tuileries" },
  { date: "1792-09-21", color: REGIME, note: "First French Republic proclaimed" },
  { date: "1793-01-21", color: TERROR, note: "Execution of Louis XVI" },
  { date: "1793-09-05", color: TERROR, note: "Reign of Terror begins" },
  { date: "1794-07-27", color: REGIME, note: "Thermidorian Reaction — fall of Robespierre" },
  { date: "1795-08-22", color: DOCUMENT, note: "Constitution of Year III" },
  { date: "1799-11-09", color: REGIME, note: "Coup of 18 Brumaire — Napoleon" },
];

const dt = new Daytiles({
  layout: Layout.Month,
  shape: Shape.Rect,
  startDate: "1789-05-01",
  endDate: "1799-11-30",
  daySize: 10,
  gap: 1,
  startDayOfWeek: 0,
  showLabels: true,
  colors: {
    futureDay: "#eaeaea",
    alternation: { mode: AlternationMode.Month, color: "#e6dff5", size: 1 },
  },
});

for (const evt of EVENTS) {
  dt.addEvent({ start: evt.date, color: evt.color, note: evt.note });
}

const info = document.getElementById("info");
dt.onTileClick(({ date, event }) => {
  info.textContent = event.note
    ? `${date.toDateString()} — ${event.note}`
    : date.toDateString();
});

const svg = document.getElementById("calendar");
dt.render(svg);
const bbox = svg.getBBox();
svg.setAttribute("width", Math.ceil(bbox.x + bbox.width));
svg.setAttribute("height", Math.ceil(bbox.y + bbox.height));
