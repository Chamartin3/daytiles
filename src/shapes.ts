export enum Shape {
  Rect = "rect",
  RoundedRect = "roundedRect",
  Circle = "circle",
  Diamond = "diamond",
}

const SVG_NS = "http://www.w3.org/2000/svg";

export function createTile(
  shape: Shape,
  x: number,
  y: number,
  size: number,
): SVGElement {
  switch (shape) {
    case Shape.Rect:
    case Shape.RoundedRect:
    case Shape.Circle:
    case Shape.Diamond:
    default: {
      const rect = document.createElementNS(SVG_NS, "rect");
      rect.setAttribute("x", String(x));
      rect.setAttribute("y", String(y));
      rect.setAttribute("width", String(size));
      rect.setAttribute("height", String(size));
      return rect;
    }
  }
}
