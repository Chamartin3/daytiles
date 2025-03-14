import { type ColorSettings } from "./colors.js";
import { type EventInfo } from "./dates.js";
import { type CalendarSettings } from "./settings.js";
interface SquareOptions {
    x: number;
    y: number;
    size: number;
    overwrites: EventInfo;
    colorSettings: ColorSettings;
}
export declare function drawDateSquare(dateToDraw: Date, { x, y, size, overwrites, colorSettings }: SquareOptions): SVGRectElement;
export declare function drawCalendar(svgElement: SVGSVGElement, settings: CalendarSettings): void;
export {};
//# sourceMappingURL=draw.d.ts.map