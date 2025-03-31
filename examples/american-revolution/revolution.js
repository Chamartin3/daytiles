import { Daytiles, Layout, Shape, AlternationMode } from "../../dist/index.js";
import { bindWiki } from "../utils/wiki.js";

const COLORS = {
  current: "#b22234",
  dayColor: "#f0e9d6",
  pastFade: 1,
  alternation: { mode: AlternationMode.Year, color: "#d6c79c", size: 1 },
  eventTypeColors: {
    political: "#3c3b6e",
    diplomacy: "#6b6e9c",
    battle: "#b22234",
    victory: "#d97706",
  },
};

const dt = new Daytiles({
  layout: Layout.Month,
  shape: Shape.Rect,
  startDate: "1775-04-01",
  endDate: "1783-09-30",
  daySize: 14,
  gap: 2,
  startDayOfWeek: 0,
  showLabels: true,
  colors: COLORS,
});

const events = await fetch("./events.json").then((r) => r.json());
dt.addEvents(events);

bindWiki(dt, {
  wiki: document.getElementById("wiki"),
  info: document.getElementById("info"),
});

dt.render(document.getElementById("calendar"));
