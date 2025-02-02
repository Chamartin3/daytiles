export interface DateContext {
  isPresent: boolean;
  isPast: boolean;
  isFuture: boolean;
  dayOfWeek: number;
  month: number;
}

export type EventInfo = { color?: string; note?: string };
export type EventsDict = Record<string, EventInfo>;

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

export function getEvent(date: Date, events: EventsDict): EventInfo {
  const formattedDate = date
    .toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
    })
    .replace("/", "-");

  return events[formattedDate] ?? {};
}

export function getDateContext(date: Date, today: Date = new Date()): DateContext {
  return {
    isPresent: date.toDateString() === today.toDateString(),
    isPast: date < today,
    isFuture: date > today,
    dayOfWeek: date.getDay(),
    month: date.getMonth(),
  };
}
