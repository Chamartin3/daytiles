import { type ColorSettings } from "./colors.js";
import { type EventInfo } from "./dates.js";
import { Shape } from "./shapes.js";
export interface TileClickEvent {
    date: Date;
    events: EventInfo[];
    domEvent: MouseEvent;
}
export type TileClickHandler = (e: TileClickEvent) => void;
interface TileOptions {
    x: number;
    y: number;
    size: number;
    shape: Shape;
    events: EventInfo[];
    colorSettings: ColorSettings;
    maxWeight: number;
    onClick?: TileClickHandler;
}
export declare function totalWeight(events: EventInfo[]): number;
export declare function drawDateTile(dateToDraw: Date, { x, y, size, shape, events, colorSettings, maxWeight, onClick }: TileOptions): SVGElement;
export {};
//# sourceMappingURL=tile.d.ts.map