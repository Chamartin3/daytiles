import { Daytiles, Layout, Shape, AlternationMode } from "../../dist/index.js";

const dt = new Daytiles({
  layout: Layout.Week,
  shape: Shape.RoundedRect,
  startDate: "2026-07-01",
  endDate: "2026-09-30",
  daySize: 24,
  gap: 4,
  startDayOfWeek: 1,
  showLabels: true,
  colors: {
    current: "#0a84ff",
    pastDay: "#dde3eb",
    futureDay: "#f6f8fb",
    alternation: { mode: AlternationMode.Custom, color: "#e3eaf3", size: 14 },
    eventTypeColors: {
      kickoff: "#34c759",
      sprint: "#0a84ff",
      checkpoint: "#ff9500",
      review: "#bf5af2",
      freeze: "#ff453a",
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
