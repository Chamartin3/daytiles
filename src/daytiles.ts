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
  wiki?: string;
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

function dateKey(date: Date): string {
  const y = String(date.getFullYear()).padStart(4, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function generateId(): DaytilesEventId {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export class Daytiles {
  private settings: CalendarSettings;
  private events: DaytilesEvent[] = [];
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
    const stamped = { ...event, id: generateId() };
    this.events.push(stamped);
    return stamped.id;
  }

  addEvents(events: DaytilesEventInput[]): DaytilesEventId[] {
    return events.map((e) => this.addEvent(e));
  }

  prependEvent(event: DaytilesEventInput): DaytilesEventId {
    const stamped = { ...event, id: generateId() };
    this.events.unshift(stamped);
    return stamped.id;
  }

  prependEvents(events: DaytilesEventInput[]): DaytilesEventId[] {
    const stamped = events.map((e) => ({ ...e, id: generateId() }));
    this.events.unshift(...stamped);
    return stamped.map((e) => e.id);
  }

  removeEvent(id: DaytilesEventId): boolean {
    const idx = this.events.findIndex((e) => e.id === id);
    if (idx === -1) return false;
    this.events.splice(idx, 1);
    return true;
  }

  clearEvents(): void {
    this.events = [];
  }

  listEvents(): DaytilesEvent[] {
    return [...this.events];
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
    const bbox = svgElement.getBBox();
    const w = Math.ceil(bbox.x + bbox.width);
    const h = Math.ceil(bbox.y + bbox.height);
    svgElement.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svgElement.setAttribute("preserveAspectRatio", "xMidYMin meet");
    svgElement.setAttribute("width", String(w));
    svgElement.setAttribute("height", String(h));
    if (!svgElement.style.maxWidth) svgElement.style.maxWidth = "100%";
    if (!svgElement.style.height) svgElement.style.height = "auto";
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
    for (const entry of this.events) {
      const start = toDate(entry.start);
      const end = entry.end ? toDate(entry.end) : start;
      const cursor = new Date(start);
      const typeColor = entry.type ? typeColors[entry.type] : undefined;
      const color = entry.color ?? typeColor ?? defaultColor;
      while (cursor.getTime() <= end.getTime()) {
        const key = dateKey(cursor);
        const note = entry.note ?? key;
        const list = out[key] ?? (out[key] = []);
        list.push({ color, note, wiki: entry.wiki, type: entry.type });
        cursor.setTime(cursor.getTime() + MS_PER_DAY);
      }
    }
    return out;
  }
}
