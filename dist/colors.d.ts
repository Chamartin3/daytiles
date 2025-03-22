import type { DateContext } from "./dates.js";
import { type AlternationSettings } from "./alternation.js";
export interface ColorHighlights {
    weekdays?: Record<number, string>;
    months?: Record<number, string>;
}
export interface ColorSettings {
    current: string;
    pastDay: string;
    futureDay: string;
    alternation: AlternationSettings;
    defaultEventColor: string;
    eventTypeColors?: Record<string, string>;
    highlightCurrent?: boolean;
    fadePastDates?: boolean | number;
    solidPastColor?: boolean;
    highlight?: ColorHighlights;
}
export declare const DATE_BOX_CLASS = "dateBox";
export declare const FUTURE_DAY_CLASS = "future-day";
export declare const PRESENT_DAY_CLASS = "present-day";
export declare const PAST_DAY_CLASS = "past-day";
export declare function getColor(dateContext: DateContext, colorSettings: ColorSettings): string;
export declare function getClasses(ctx: Pick<DateContext, "isPresent" | "isPast" | "isFuture">): string[];
//# sourceMappingURL=colors.d.ts.map