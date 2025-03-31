import { Daytiles, Layout, Shape, AlternationMode } from "../../dist/index.js";
import { bindWiki } from "../utils/wiki.js";

const COLORS = {
  current: "#0055a4",
  dayColor: "#dfe7f7",
  pastFade: 1,
  alternation: { mode: AlternationMode.Year, color: "#a8b8d9", size: 1 },
  eventTypeColors: {
    political: "#0055a4",
    uprising: "#6e6aaa",
    terror: "#c94a6e",
    war: "#ef4135",
  },
};

const dt = new Daytiles({
  layout: Layout.Custom,
  shape: Shape.Rect,
  startDate: "1789-05-01",
  endDate: "1799-11-30",
  daySize: 10,
  gap: 1,
  daysPerRow: 90,
  startDayOfWeek: 0,
  showLabels: false,
  colors: COLORS,
});

const events = await fetch("./events.json").then((r) => r.json());
dt.addEvents(events);

bindWiki(dt, {
  wiki: document.getElementById("wiki"),
  info: document.getElementById("info"),
});

dt.render(document.getElementById("calendar"));
