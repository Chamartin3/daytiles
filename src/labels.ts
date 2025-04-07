import { Layout } from "./settings.js";

export const ROW_LABEL_CLASS = "DayTiles--rowLabel";
export const ROW_LABEL_GAP = 8;

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function rowLabel(
  layout: Layout,
  date: Date,
  rowIndex: number,
  daysPerRow: number,
): string {
  switch (layout) {
    case Layout.Month:
      return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
    case Layout.Week:
      return `W${isoWeek(date)}`;
    case Layout.Weekday:
      return DAY_NAMES[date.getDay()] ?? "";
    case Layout.Custom:
      return `${rowIndex * daysPerRow + 1}`;
    default:
      return "";
  }
}
