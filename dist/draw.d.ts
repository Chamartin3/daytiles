import { type ColorSettings } from "./colors.js";
import { type EventInfo } from "./dates.js";
import { type CalendarSettings } from "./settings.js";
import { Shape } from "./shapes.js";
export interface TileClickEvent {
    date: Date;
    event: EventInfo;
    domEvent: MouseEvent;
}
export type TileClickHandler = (e: TileClickEvent) => void;
interface TileOptions {
    x: number;
    y: number;
    size: number;
    shape: Shape;
    overwrites: EventInfo;
    colorSettings: ColorSettings;
    onClick?: TileClickHandler;
}
export declare function drawDateTile(dateToDraw: Date, { x, y, size, shape, overwrites, colorSettings, onClick }: TileOptions): SVGElement;
export declare function drawCalendar(svgElement: SVGSVGElement, settings: CalendarSettings, onTileClick?: TileClickHandler): void;
export {};
//# sourceMappingURL=draw.d.ts.map