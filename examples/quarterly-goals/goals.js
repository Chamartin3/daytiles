import { Daytiles, Layout, Shape, AlternationMode } from "daytiles";
import { renderConfig } from "../utils/config.js";

const COLORS = {
  current: "#0a84ff",
  dayColor: "#f6f8fb",
  pastFade: 0.9,
  alternation: { mode: AlternationMode.Custom, color: "#e3eaf3", size: 14 },
  eventTypeColors: {
    kickoff: "#34c759",
    sprint: "#0a84ff",
    checkpoint: "#ff9500",
    review: "#bf5af2",
    freeze: "#ff453a",
  },
};

const CONFIG = {
  layout: Layout.Week,
  shape: Shape.RoundedRect,
  startDate: "2026-07-01",
  endDate: "2026-09-30",
  daySize: 24,
  gap: 4,
  startDayOfWeek: 1,
  showLabels: true,
  colors: COLORS,
};

const dt = new Daytiles(CONFIG);

const events = await fetch("./events.json").then((r) => r.json());
dt.addEvents(events);

const info = document.getElementById("info");
dt.onTileClick(({ date, event }) => {
  info.textContent = event.note
    ? `${date.toDateString()}: ${event.note}`
    : date.toDateString();
});

dt.render(document.getElementById("calendar"));

renderConfig(document.getElementById("config"), CONFIG);
