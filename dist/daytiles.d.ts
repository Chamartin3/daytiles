import { type TileClickHandler } from "./draw.js";
import { type CalendarSettings } from "./settings.js";
import type { DateInput } from "./dates.js";
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
export interface DaytilesOptions extends Partial<Omit<CalendarSettings, "colors" | "events">> {
    colors?: Partial<ColorSettings>;
}
export declare class Daytiles {
    private settings;
    private readonly events;
    private tileClickHandler?;
    constructor(options?: DaytilesOptions);
    update(options: DaytilesOptions): void;
    onTileClick(handler: TileClickHandler | undefined): void;
    addEvent(event: DaytilesEventInput): DaytilesEventId;
    removeEvent(id: DaytilesEventId): boolean;
    clearEvents(): void;
    listEvents(): DaytilesEvent[];
    getSettings(): CalendarSettings;
    render(svgElement: SVGSVGElement): void;
    private mergeSettings;
    private flattenEvents;
}
//# sourceMappingURL=daytiles.d.ts.map