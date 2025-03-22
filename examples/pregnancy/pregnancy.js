import { Daytiles, Layout, Shape, AlternationMode } from "../../dist/index.js";

const LMP = "2026-01-15";
const DUE = "2026-10-22";

const dt = new Daytiles({
  layout: Layout.Week,
  shape: Shape.Circle,
  startDate: LMP,
  endDate: DUE,
  daySize: 22,
  gap: 4,
  startDayOfWeek: 1,
  showLabels: true,
  colors: {
    alternation: { mode: AlternationMode.Week, color: "#f0f4ff", size: 1 },
  },
});

const events = await fetch("./events.json").then((r) => r.json());
for (const evt of events) dt.addEvent(evt);

const info = document.getElementById("info");
dt.onTileClick(({ date, event }) => {
  info.textContent = event.note
    ? `${date.toDateString()}: ${event.note}`
    : date.toDateString();
});

const svg = document.getElementById("calendar");
dt.render(svg);
const bbox = svg.getBBox();
svg.setAttribute("width", Math.ceil(bbox.x + bbox.width));
svg.setAttribute("height", Math.ceil(bbox.y + bbox.height));
