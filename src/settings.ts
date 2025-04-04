import type { ColorSettings } from "./colors.js";
import type { DateInput, EventsDict } from "./dates.js";
import { Shape } from "./shapes.js";
import { AlternationMode } from "./alternation.js";

export enum Layout {
  Month = "month",
  Week = "week",
  Weekday = "weekday",
  Custom = "custom",
}

export interface CalendarSettings {
  layout: Layout;
  startDate: DateInput;
  endDate: DateInput;
  year: number | null;
  daySize: number;
  gap: number;
  startDayOfWeek: number;
  daysPerRow: number;
  showLabels: boolean;
  labelWidth: number;
  shape: Shape;
  events: EventsDict;
  colors: ColorSettings;
}

export const BaseCalendarSettings: CalendarSettings = {
  layout: Layout.Weekday,
  startDate: "03-01",
  endDate: "06",
  year: null,
  daySize: 16,
  gap: 4,
  startDayOfWeek: 1,
  daysPerRow: 21,
  showLabels: false,
  labelWidth: 56,
  shape: Shape.Rect,
  events: {},
  colors: {
    current: "#FFD700",
    dayColor: "#eee",
    pastFade: 0.6,
    alternation: {
      mode: AlternationMode.Month,
      color: "#d2f0fa",
      size: 7,
    },
    defaultEventColor: "#ff5577",
    heatmap: false,
    heatmapLow: 0.2,
    heatmapHigh: 0.35,
    highlight: {
      weekdays: {},
      months: {},
    },
  },
};
