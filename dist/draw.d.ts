import { type ColorSettings } from "./colors.js";
import { type EventInfo } from "./dates.js";
import { type CalendarSettings } from "./settings.js";
import { Shape } from "./shapes.js";
interface TileOptions {
    x: number;
    y: number;
    size: number;
    shape: Shape;
    overwrites: EventInfo;
    colorSettings: ColorSettings;
}
export declare function drawDateTile(dateToDraw: Date, { x, y, size, shape, overwrites, colorSettings }: TileOptions): SVGElement;
export declare function drawCalendar(svgElement: SVGSVGElement, settings: CalendarSettings): void;
export {};
//# sourceMappingURL=draw.d.ts.map