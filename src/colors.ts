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
  heatmap?: boolean;
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

function parseHex(hex: string): [number, number, number] | null {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length !== 6) return null;
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return null;
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function toHex(rgb: [number, number, number]): string {
  return (
    "#" +
    rgb
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

export function lerpHex(a: string, b: string, t: number): string {
  const ca = parseHex(a);
  const cb = parseHex(b);
  if (!ca || !cb) return b;
  const k = Math.max(0, Math.min(1, t));
  return toHex([
    ca[0] + (cb[0] - ca[0]) * k,
    ca[1] + (cb[1] - ca[1]) * k,
    ca[2] + (cb[2] - ca[2]) * k,
  ]);
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
