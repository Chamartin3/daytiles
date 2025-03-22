import { Daytiles, Layout, Shape, AlternationMode } from "../../dist/index.js";

const BATTLE = "#d62728";
const VICTORY = "#ff9500";
const DOCUMENT = "#1f77b4";

const EVENTS = [
  { date: "1775-04-19", color: BATTLE, note: "Lexington and Concord" },
  { date: "1775-06-17", color: BATTLE, note: "Battle of Bunker Hill" },
  { date: "1776-07-04", color: DOCUMENT, note: "Declaration of Independence" },
  { date: "1776-12-26", color: VICTORY, note: "Battle of Trenton" },
  { date: "1777-10-17", color: VICTORY, note: "Surrender at Saratoga" },
  { date: "1778-02-06", color: DOCUMENT, note: "Treaty of Alliance with France" },
  { date: "1781-10-19", color: VICTORY, note: "British surrender at Yorktown" },
  { date: "1783-09-03", color: DOCUMENT, note: "Treaty of Paris signed" },
];

const dt = new Daytiles({
  layout: Layout.Month,
  shape: Shape.Rect,
  startDate: "1775-04-01",
  endDate: "1783-09-30",
  daySize: 10,
  gap: 1,
  startDayOfWeek: 0,
  showLabels: true,
  colors: {
    futureDay: "#eaeaea",
    alternation: { mode: AlternationMode.Month, color: "#f5e6d3", size: 1 },
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
