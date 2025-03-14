import { drawCalendar } from "./draw.js";
import { BaseCalendarSettings, } from "./settings.js";
const MS_PER_DAY = 86_400_000;
function toDate(value) {
    if (value instanceof Date)
        return new Date(value);
    const parts = value.split("-").map((n) => parseInt(n, 10));
    if (parts.length === 3) {
        const [y, m, d] = parts;
        return new Date(y, (m ?? 1) - 1, d ?? 1);
    }
    throw new Error(`Unsupported date value: ${value}`);
}
function monthDayKey(date) {
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${m}-${d}`;
}
function generateId() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
export class Daytiles {
    settings;
    events = new Map();
    constructor(options = {}) {
        this.settings = this.mergeSettings(BaseCalendarSettings, options);
    }
    update(options) {
        this.settings = this.mergeSettings(this.settings, options);
    }
    addEvent(event) {
        const id = generateId();
        this.events.set(id, { ...event, id });
        return id;
    }
    removeEvent(id) {
        return this.events.delete(id);
    }
    clearEvents() {
        this.events.clear();
    }
    listEvents() {
        return Array.from(this.events.values());
    }
    getSettings() {
        return this.settings;
    }
    render(svgElement) {
        const events = this.flattenEvents();
        drawCalendar(svgElement, { ...this.settings, events });
    }
    mergeSettings(base, overrides) {
        const { colors, ...rest } = overrides;
        return {
            ...base,
            ...rest,
            colors: { ...base.colors, ...(colors ?? {}) },
            events: {},
        };
    }
    flattenEvents() {
        const out = {};
        for (const entry of this.events.values()) {
            const start = toDate(entry.start);
            const end = entry.end ? toDate(entry.end) : start;
            const cursor = new Date(start);
            while (cursor.getTime() <= end.getTime()) {
                const key = monthDayKey(cursor);
                const note = entry.note ?? key;
                const existing = out[key];
                out[key] = {
                    color: entry.color ?? existing?.color,
                    note: existing?.note ? `${existing.note} • ${note}` : note,
                };
                cursor.setTime(cursor.getTime() + MS_PER_DAY);
            }
        }
        return out;
    }
}
//# sourceMappingURL=daytiles.js.map