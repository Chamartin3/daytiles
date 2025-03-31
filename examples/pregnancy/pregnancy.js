import { Daytiles, Layout, Shape, AlternationMode } from "../../dist/index.js";

const LMP = "2026-01-15";
const DUE = "2026-10-22";

const COLORS = {
  current: "#ff7eb6",
  dayColor: "#fff5f7",
  pastFade: 0.85,
  alternation: { mode: AlternationMode.Week, color: "#f7e6f0", size: 1 },
  eventTypeColors: {
    ultrasound: "#bf5af2",
    screening: "#0a84ff",
    routine: "#34c759",
    due: "#ff453a",
  },
};

const dt = new Daytiles({
  layout: Layout.Week,
  shape: Shape.Circle,
  startDate: LMP,
  endDate: DUE,
  daySize: 14,
  gap: 2,
  startDayOfWeek: 1,
  showLabels: true,
  colors: COLORS,
});

const events = await fetch("./events.json").then((r) => r.json());
dt.addEvents(events);

const info = document.getElementById("info");
dt.onTileClick(({ date, event }) => {
  info.textContent = event.note
    ? `${date.toDateString()}: ${event.note}`
    : date.toDateString();
});

dt.render(document.getElementById("calendar"));
