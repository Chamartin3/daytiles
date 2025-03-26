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
    current: "#ff7eb6",
    pastDay: "#e6c2c9",
    futureDay: "#fff5f7",
    alternation: { mode: AlternationMode.Week, color: "#f7e6f0", size: 1 },
    eventTypeColors: {
      ultrasound: "#bf5af2",
      screening: "#0a84ff",
      routine: "#34c759",
      due: "#ff453a",
    },
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
