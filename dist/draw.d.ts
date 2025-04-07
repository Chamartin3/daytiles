import { type CalendarSettings } from "./settings.js";
import { type TileClickHandler } from "./tile.js";
export type { TileClickEvent, TileClickHandler } from "./tile.js";
export declare const CONTAINER_CLASS = "DayTilesContainer";
export declare function drawCalendar(svgElement: SVGSVGElement, settings: CalendarSettings, onTileClick?: TileClickHandler): void;
//# sourceMappingURL=draw.d.ts.map