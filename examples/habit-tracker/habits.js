import { Daytiles, Layout, Shape, AlternationMode } from "../../dist/index.js";

const START = "2026-03-08";
const END = "2026-05-06";

const dt = new Daytiles({
  layout: Layout.Weekday,
  shape: Shape.RoundedRect,
  startDate: START,
  endDate: END,
  daySize: 22,
  gap: 4,
  startDayOfWeek: 1,
  showLabels: true,
  colors: {
    alternation: { mode: AlternationMode.None, color: "#d2f0fa", size: 7 },
    eventTypeColors: {
      workout: "#34c759",
      reading: "#0a84ff",
      both: "#ff9500",
    },
  },
});

const events = await fetch("./events.json").then((r) => r.json());
for (const evt of events) dt.addEvent(evt);

dt.onTileClick(({ date, event }) => {
  console.log(date.toDateString(), event.note ?? "no habits");
});

const svg = document.getElementById("calendar");
dt.render(svg);
const bbox = svg.getBBox();
svg.setAttribute("width", Math.ceil(bbox.x + bbox.width));
svg.setAttribute("height", Math.ceil(bbox.y + bbox.height));
