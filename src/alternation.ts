import type { DateContext } from "./dates.js";

export enum AlternationMode {
  None = "none",
  Day = "day",
  Week = "week",
  Month = "month",
  Year = "year",
  Custom = "custom",
}

export interface AlternationSettings {
  mode: AlternationMode;
  color: string;
  size: number;
}

export function alternationBucket(
  ctx: DateContext,
  mode: AlternationMode,
  size: number,
): number {
  switch (mode) {
    case AlternationMode.Day:
      return ctx.dayOfYear;
    case AlternationMode.Week:
      return ctx.weekOfYear;
    case AlternationMode.Month:
      return ctx.month;
    case AlternationMode.Year:
      return ctx.year;
    case AlternationMode.Custom:
      return Math.floor(ctx.dayOfYear / Math.max(1, size));
    case AlternationMode.None:
    default:
      return -1;
  }
}

export function shouldAlternate(
  ctx: DateContext,
  alternation: AlternationSettings,
): boolean {
  if (alternation.mode === AlternationMode.None) return false;
  const bucket = alternationBucket(ctx, alternation.mode, alternation.size);
  return bucket >= 0 && bucket % 2 === 0;
}
