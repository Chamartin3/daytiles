import { Daytiles, Layout, Shape, AlternationMode } from "../../dist/index.js";

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
    current: "#0055a4",
    pastDay: "#dcd8e8",
    futureDay: "#f0eef7",
    alternation: { mode: AlternationMode.Month, color: "#dfe4f1", size: 1 },
    eventTypeColors: {
      uprising: "#d62728",
      document: "#1f77b4",
      terror: "#2c3e50",
      regime: "#ff9500",
    },
  },
});

const events = await fetch("./events.json").then((r) => r.json());
for (const evt of events) dt.addEvent(evt);

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
