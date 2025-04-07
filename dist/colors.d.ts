import type { DateContext } from "./dates.js";
import { type AlternationSettings } from "./alternation.js";
export interface ColorHighlights {
    weekdays?: Record<number, string>;
    months?: Record<number, string>;
}
export interface ColorSettings {
    current: string;
    dayColor: string;
    pastFade?: number;
    futureFade?: number;
    alternation: AlternationSettings;
    defaultEventColor: string;
    eventTypeColors?: Record<string, string>;
    highlightCurrent?: boolean;
    highlight?: ColorHighlights;
    heatmap?: boolean;
    heatmapLow?: number;
    heatmapHigh?: number;
}
export declare const DATE_BOX_CLASS = "DayTiles--day";
export declare const FUTURE_DAY_CLASS = "DayTiles--day--future";
export declare const PRESENT_DAY_CLASS = "DayTiles--day--present";
export declare const PAST_DAY_CLASS = "DayTiles--day--past";
export declare function getColor(dateContext: DateContext, colorSettings: ColorSettings): string;
export declare function lerpHex(a: string, b: string, t: number): string;
export declare function getClasses(ctx: Pick<DateContext, "isPresent" | "isPast" | "isFuture">): string[];
//# sourceMappingURL=colors.d.ts.map