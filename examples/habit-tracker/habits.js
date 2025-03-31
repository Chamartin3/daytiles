import { Daytiles, Layout, Shape, AlternationMode } from "../../dist/index.js";

const START = "2026-03-08";
const END = "2026-05-06";

const COLORS = {
  current: "#ffd60a",
  dayColor: "#f4f6f8",
  pastFade: 0.9,
  alternation: { mode: AlternationMode.None, color: "#eef1f4", size: 7 },
  eventTypeColors: {
    workout: "#34c759",
    reading: "#0a84ff",
    both: "#ff9500",
  },
};

const dt = new Daytiles({
  layout: Layout.Weekday,
  shape: Shape.RoundedRect,
  startDate: START,
  endDate: END,
  daySize: 22,
  gap: 4,
  startDayOfWeek: 1,
  showLabels: true,
  colors: COLORS,
});

const events = await fetch("./events.json").then((r) => r.json());
dt.addEvents(events);

dt.onTileClick(({ date, event }) => {
  console.log(date.toDateString(), event.note ?? "no habits");
});

dt.render(document.getElementById("calendar"));
