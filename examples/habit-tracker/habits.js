import { Daytiles, Layout, Shape, AlternationMode } from "../../dist/index.js";

const WORKOUT_COLOR = "#34c759";
const READING_COLOR = "#0a84ff";
const BOTH_COLOR = "#ff9500";
const HABIT_DAYS = 60;
const WORKOUT_WEEKDAYS = new Set([1, 3, 5, 6]);
const READING_SKIP_RATE = 0.25;

function isoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const today = new Date();
const start = new Date(today);
start.setDate(today.getDate() - (HABIT_DAYS - 1));

const dt = new Daytiles({
  layout: Layout.Weekday,
  shape: Shape.RoundedRect,
  startDate: isoDate(start),
  endDate: isoDate(today),
  daySize: 22,
  gap: 4,
  startDayOfWeek: 1,
  showLabels: true,
  colors: {
    alternation: { mode: AlternationMode.None, color: "#d2f0fa", size: 7 },
  },
});

const cursor = new Date(start);
let i = 0;
while (cursor <= today) {
  const dow = cursor.getDay();
  const didWorkout = WORKOUT_WEEKDAYS.has(dow);
  const didReading = ((i * 7919) % 100) / 100 > READING_SKIP_RATE;
  const dateString = isoDate(cursor);
  if (didWorkout && didReading) {
    dt.addEvent({ start: dateString, color: BOTH_COLOR, note: "Workout + Reading" });
  } else if (didWorkout) {
    dt.addEvent({ start: dateString, color: WORKOUT_COLOR, note: "Workout" });
  } else if (didReading) {
    dt.addEvent({ start: dateString, color: READING_COLOR, note: "Reading" });
  }
  cursor.setDate(cursor.getDate() + 1);
  i++;
}

dt.onTileClick(({ date, event }) => {
  console.log(date.toDateString(), event.note ?? "no habits");
});

const svg = document.getElementById("calendar");
dt.render(svg);
const bbox = svg.getBBox();
svg.setAttribute("width", Math.ceil(bbox.x + bbox.width));
svg.setAttribute("height", Math.ceil(bbox.y + bbox.height));
