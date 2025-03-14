import type { ColorSettings } from "./colors.js";
import type { DateInput, EventsDict } from "./dates.js";
import { Shape } from "./shapes.js";
export declare enum Layout {
    Month = "month",
    Week = "week",
    Weekday = "weekday",
    Custom = "custom"
}
export declare enum PastMode {
    None = "none",
    Fade = "fade",
    Solid = "solid"
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
export declare const BaseCalendarSettings: CalendarSettings;
//# sourceMappingURL=settings.d.ts.map