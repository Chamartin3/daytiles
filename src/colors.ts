import type { DateContext } from "./dates.js";
import {
  AlternationMode,
  shouldAlternate,
  type AlternationSettings,
} from "./alternation.js";

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
}

export const DATE_BOX_CLASS = "dateBox";
export const FUTURE_DAY_CLASS = "future-day";
export const PRESENT_DAY_CLASS = "present-day";
export const PAST_DAY_CLASS = "past-day";

export function getColor(
  dateContext: DateContext,
  colorSettings: ColorSettings,
): string {
  const { current: currentColor, dayColor, alternation } = colorSettings;
  const weekdayColors = colorSettings.highlight?.weekdays ?? {};
  const monthColors = colorSettings.highlight?.months ?? {};
  const highlightCurrent = colorSettings.highlightCurrent !== false;

  if (highlightCurrent && dateContext.isPresent) return currentColor;
  const weekdayMatch = weekdayColors[dateContext.dayOfWeek];
  if (weekdayMatch) return weekdayMatch;
  const monthMatch = monthColors[dateContext.month];
  if (monthMatch) return monthMatch;
  if (shouldAlternate(dateContext, alternation)) {
    return alternation.color;
  }
  return dayColor;
}

export function getClasses(ctx: Pick<DateContext, "isPresent" | "isPast" | "isFuture">): string[] {
  const classList = [DATE_BOX_CLASS];
  if (ctx.isFuture) classList.push(FUTURE_DAY_CLASS);
  if (ctx.isPresent) {
    classList.push(PRESENT_DAY_CLASS);
  } else if (ctx.isPast) {
    classList.push(PAST_DAY_CLASS);
  }
  return classList;
}
