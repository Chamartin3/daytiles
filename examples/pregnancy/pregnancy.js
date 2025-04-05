import { Daytiles, Layout, Shape, AlternationMode } from "../../dist/index.js";
import { renderConfig } from "../utils/config.js";

const DAY_MS = 86_400_000;
const WEEKS_PREGNANT = 16;

function isoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const today = new Date();
today.setHours(0, 0, 0, 0);
const lmpDate = new Date(today.getTime() - WEEKS_PREGNANT * 7 * DAY_MS);
const dueDate = new Date(lmpDate.getTime() + 280 * DAY_MS);
const LMP = isoDate(lmpDate);
const DUE = isoDate(dueDate);

const APPOINTMENTS = [
  { week: 8, type: "ultrasound", note: "Week 8: Early ultrasound" },
  { week: 12, type: "screening", note: "Week 12: NT scan" },
  { week: 16, type: "screening", note: "Week 16: Quad screen" },
  { week: 20, type: "ultrasound", note: "Week 20: Anatomy scan" },
  { week: 24, type: "routine", note: "Week 24: Routine check" },
  { week: 28, type: "screening", note: "Week 28: Glucose test" },
  { week: 32, type: "routine", note: "Week 32: Routine check" },
  { week: 36, type: "routine", note: "Week 36: Routine check" },
  { week: 38, type: "routine", note: "Week 38: Routine check" },
  { week: 40, type: "due", note: "Estimated due date" },
];

const events = APPOINTMENTS.map(({ week, type, note }) => ({
  start: isoDate(new Date(lmpDate.getTime() + week * 7 * DAY_MS)),
  type,
  note,
}));

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

const CONFIG = {
  layout: Layout.Week,
  shape: Shape.Circle,
  startDate: LMP,
  endDate: DUE,
  daySize: 14,
  gap: 2,
  startDayOfWeek: 1,
  showLabels: true,
  colors: COLORS,
};

const dt = new Daytiles(CONFIG);
dt.addEvents(events);

const info = document.getElementById("info");
dt.onTileClick(({ date, events }) => {
  const event = events[0];
  info.textContent = event?.note
    ? `${date.toDateString()}: ${event.note}`
    : date.toDateString();
});

dt.render(document.getElementById("calendar"));

renderConfig(document.getElementById("config"), CONFIG);
