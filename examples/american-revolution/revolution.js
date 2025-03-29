import { Daytiles, Layout, Shape, AlternationMode } from "../../dist/index.js";

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
    current: "#b22234",
    fadePastDates: false,
    pastDay: "#f6efe1",
    futureDay: "#f6efe1",
    alternation: { mode: AlternationMode.Month, color: "#e9d8b8", size: 1 },
    eventTypeColors: {
      battle: "#d62728",
      victory: "#ff9500",
      document: "#1f77b4",
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
