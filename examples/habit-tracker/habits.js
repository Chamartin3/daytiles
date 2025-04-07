import { Daytiles, Layout, Shape, AlternationMode } from "daytiles";
import { renderConfig } from "../utils/config.js";

function isoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const START = "2025-01-01";
const END = "2025-03-31";
const start = new Date(2025, 0, 1);
const DAYS = Math.round((new Date(2025, 2, 31) - start) / 86_400_000) + 1;

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const HABITS = [
  { id: "workout", label: "Workout", color: "#34c759", probability: 0.6, seed: 1 },
  { id: "reading", label: "Reading", color: "#0a84ff", probability: 0.75, seed: 2 },
  { id: "meditation", label: "Meditation", color: "#bf5af2", probability: 0.5, seed: 3 },
];

function generateEvents(habit) {
  const rng = mulberry32(habit.seed);
  const events = [];
  const cursor = new Date(start);
  for (let i = 0; i < DAYS; i++) {
    if (rng() < habit.probability) {
      events.push({ start: isoDate(cursor), type: habit.id, note: habit.label });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return events;
}

const BASE_COLORS = {
  dayColor: "#f4f6f8",
  pastFade: 1,
  highlightCurrent: false,
  alternation: { mode: AlternationMode.Week, color: "#eef1f4", size: 1 },
  highlight: { weekdays: { 0: "#b8c0cc", 6: "#b8c0cc" } },
};

const BASE_CONFIG = {
  layout: Layout.Custom,
  shape: Shape.RoundedRect,
  startDate: START,
  endDate: END,
  daySize: 12,
  gap: 2,
  daysPerRow: DAYS,
  showLabels: false,
};

const trackersEl = document.getElementById("trackers");

for (const habit of HABITS) {
  const row = document.createElement("div");
  row.className = "tracker-row";
  const label = document.createElement("div");
  label.className = "tracker-label";
  label.innerHTML = `<i class="swatch" style="background:${habit.color}"></i>${habit.label}`;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  row.appendChild(label);
  row.appendChild(svg);
  trackersEl.appendChild(row);

  const config = {
    ...BASE_CONFIG,
    colors: {
      ...BASE_COLORS,
      defaultEventColor: habit.color,
      eventTypeColors: { [habit.id]: habit.color },
    },
  };
  const dt = new Daytiles(config);
  dt.addEvents(generateEvents(habit));
  dt.render(svg);
}

renderConfig(document.getElementById("config"), {
  ...BASE_CONFIG,
  colors: BASE_COLORS,
});
