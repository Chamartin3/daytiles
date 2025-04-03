export interface DateContext {
  isPresent: boolean;
  isPast: boolean;
  isFuture: boolean;
  dayOfWeek: number;
  month: number;
  year: number;
  dayOfYear: number;
  weekOfYear: number;
}

export type EventInfo = {
  color?: string;
  note?: string;
  wiki?: string;
  type?: string;
};
export type EventsDict = Record<string, EventInfo[]>;

export type DateInput = Date | string;

export function stringToDate(
  datestring: string,
  year: number,
  last: boolean = false,
): Date {
  const [month, day] = datestring.split("-");
  const monthNum = parseInt(month ?? "1");
  const dayNum = parseInt(day ?? "") || !last ? 1 : null;
  if (dayNum) {
    return new Date(year, monthNum - 1, dayNum);
  }
  return new Date(year, monthNum, 0);
}

function toDate(value: DateInput, fallbackYear: number, last: boolean): Date {
  if (value instanceof Date) return new Date(value);
  if (typeof value === "string") {
    const parts = value.split("-");
    if (parts.length === 3) {
      const [y, m, d] = parts.map((n) => parseInt(n));
      return new Date(y!, (m ?? 1) - 1, d ?? 1);
    }
    return stringToDate(value, fallbackYear, last);
  }
  throw new Error("Unsupported date value");
}

export function getRangeDates(
  initial: DateInput,
  final: DateInput,
  year: number | null = null,
): { startDate: Date; endDate: Date } {
  const dateYear = year ?? new Date().getFullYear();
  return {
    startDate: toDate(initial, dateYear, false),
    endDate: toDate(final, dateYear, true),
  };
}

export function getEvents(date: Date, events: EventsDict): EventInfo[] {
  const y = String(date.getFullYear()).padStart(4, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return events[`${y}-${m}-${d}`] ?? [];
}

const MS_PER_DAY = 86_400_000;

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  return Math.floor((date.getTime() - start.getTime()) / MS_PER_DAY);
}

function isoWeekOfYear(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / MS_PER_DAY + 1) / 7);
}

export function getDateContext(date: Date, today: Date = new Date()): DateContext {
  return {
    isPresent: date.toDateString() === today.toDateString(),
    isPast: date < today,
    isFuture: date > today,
    dayOfWeek: date.getDay(),
    month: date.getMonth(),
    year: date.getFullYear(),
    dayOfYear: dayOfYear(date),
    weekOfYear: isoWeekOfYear(date),
  };
}
