import type { DateContext } from "./dates.js";
export declare enum AlternationMode {
    None = "none",
    Day = "day",
    Week = "week",
    Month = "month",
    Custom = "custom"
}
export interface AlternationSettings {
    mode: AlternationMode;
    color: string;
    size: number;
}
export declare function alternationBucket(ctx: DateContext, mode: AlternationMode, size: number): number;
export declare function shouldAlternate(ctx: DateContext, alternation: AlternationSettings): boolean;
//# sourceMappingURL=alternation.d.ts.map