import { drawCalendar, type TileClickHandler } from "./draw.js";
import {
  BaseCalendarSettings,
  type CalendarSettings,
} from "./settings.js";
import type { DateInput, EventsDict } from "./dates.js";
import type { ColorSettings } from "./colors.js";

export type DaytilesEventId = string;

export interface DaytilesEventInput {
  start: DateInput;
  end?: DateInput;
  color?: string;
  type?: string;
  note?: string;
}

export interface DaytilesEvent extends DaytilesEventInput {
  id: DaytilesEventId;
}

export interface DaytilesOptions
  extends Partial<Omit<CalendarSettings, "colors" | "events">> {
  colors?: Partial<ColorSettings>;
}

const MS_PER_DAY = 86_400_000;

function toDate(value: DateInput): Date {
  if (value instanceof Date) return new Date(value);
  const parts = value.split("-").map((n) => parseInt(n, 10));
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return new Date(y!, (m ?? 1) - 1, d ?? 1);
  }
  throw new Error(`Unsupported date value: ${value}`);
}

function monthDayKey(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${m}-${d}`;
}

function generateId(): DaytilesEventId {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export class Daytiles {
  private settings: CalendarSettings;
  private readonly events: Map<DaytilesEventId, DaytilesEvent> = new Map();
  private tileClickHandler?: TileClickHandler;

  constructor(options: DaytilesOptions = {}) {
    this.settings = this.mergeSettings(BaseCalendarSettings, options);
  }

  update(options: DaytilesOptions): void {
    this.settings = this.mergeSettings(this.settings, options);
  }

  onTileClick(handler: TileClickHandler | undefined): void {
    this.tileClickHandler = handler;
  }

  addEvent(event: DaytilesEventInput): DaytilesEventId {
    const id = generateId();
    this.events.set(id, { ...event, id });
    return id;
  }

  removeEvent(id: DaytilesEventId): boolean {
    return this.events.delete(id);
  }

  clearEvents(): void {
    this.events.clear();
  }

  listEvents(): DaytilesEvent[] {
    return Array.from(this.events.values());
  }

  getSettings(): CalendarSettings {
    return this.settings;
  }

  render(svgElement: SVGSVGElement): void {
    const { defaultEventColor, eventTypeColors } = this.settings.colors;
    const events = this.flattenEvents(defaultEventColor, eventTypeColors ?? {});
    drawCalendar(
      svgElement,
      { ...this.settings, events },
      this.tileClickHandler,
    );
  }

  private mergeSettings(
    base: CalendarSettings,
    overrides: DaytilesOptions,
  ): CalendarSettings {
    const { colors, ...rest } = overrides;
    return {
      ...base,
      ...rest,
      colors: { ...base.colors, ...(colors ?? {}) },
      events: {},
    };
  }

  private flattenEvents(
    defaultColor: string,
    typeColors: Record<string, string>,
  ): EventsDict {
    const out: EventsDict = {};
    for (const entry of this.events.values()) {
      const start = toDate(entry.start);
      const end = entry.end ? toDate(entry.end) : start;
      const cursor = new Date(start);
      const typeColor = entry.type ? typeColors[entry.type] : undefined;
      const color = entry.color ?? typeColor ?? defaultColor;
      while (cursor.getTime() <= end.getTime()) {
        const key = monthDayKey(cursor);
        const note = entry.note ?? key;
        const existing = out[key];
        out[key] = {
          color: existing?.color ?? color,
          note: existing?.note ? `${existing.note} • ${note}` : note,
        };
        cursor.setTime(cursor.getTime() + MS_PER_DAY);
      }
    }
    return out;
  }
}
