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

export enum PastMode {
  None = "none",
  Fade = "fade",
  Solid = "solid",
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
    fadePastDates: true,
    pastDay: "#555",
    futureDay: "#eee",
    alternation: {
      mode: AlternationMode.Month,
      color: "#d2f0fa",
      size: 7,
    },
    defaultEventColor: "#ff5577",
    highlight: {
      weekdays: {
        0: "#BAFFC9",
        6: "#BAFFC9",
      },
      months: {},
    },
  },
};
