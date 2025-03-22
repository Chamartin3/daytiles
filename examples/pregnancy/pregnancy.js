import { Daytiles, Layout, Shape, AlternationMode } from "../../dist/index.js";

const ULTRASOUND = "#bf5af2";
const SCREENING = "#0a84ff";
const ROUTINE = "#34c759";
const DUE_DATE = "#ff453a";

const LMP = "2026-01-15";
const DUE = "2026-10-22";

const APPOINTMENTS = [
  { date: "2026-03-12", color: ULTRASOUND, note: "Week 8 — Early ultrasound" },
  { date: "2026-04-09", color: SCREENING, note: "Week 12 — NT scan" },
  { date: "2026-05-07", color: SCREENING, note: "Week 16 — Quad screen" },
  { date: "2026-06-04", color: ULTRASOUND, note: "Week 20 — Anatomy scan" },
  { date: "2026-07-02", color: ROUTINE, note: "Week 24 — Routine check" },
  { date: "2026-07-30", color: SCREENING, note: "Week 28 — Glucose test" },
  { date: "2026-08-27", color: ROUTINE, note: "Week 32 — Routine check" },
  { date: "2026-09-24", color: ROUTINE, note: "Week 36 — Routine check" },
  { date: "2026-10-08", color: ROUTINE, note: "Week 38 — Routine check" },
  { date: DUE, color: DUE_DATE, note: "Estimated due date" },
];

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

for (const appt of APPOINTMENTS) {
  dt.addEvent({ start: appt.date, color: appt.color, note: appt.note });
}

const info = document.getElementById("info");
dt.onTileClick(({ date, event }) => {
  if (event.note) {
    info.textContent = `${date.toDateString()}: ${event.note}`;
  } else {
    info.textContent = date.toDateString();
  }
});

const svg = document.getElementById("calendar");
dt.render(svg);
const bbox = svg.getBBox();
svg.setAttribute("width", Math.ceil(bbox.x + bbox.width));
svg.setAttribute("height", Math.ceil(bbox.y + bbox.height));
