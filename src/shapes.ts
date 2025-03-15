export enum Shape {
  Rect = "rect",
  RoundedRect = "roundedRect",
  Circle = "circle",
  Diamond = "diamond",
}

const SVG_NS = "http://www.w3.org/2000/svg";
const ROUNDED_RECT_RADIUS_RATIO = 0.25;

function makeRect(x: number, y: number, size: number, radius = 0): SVGRectElement {
  const rect = document.createElementNS(SVG_NS, "rect");
  rect.setAttribute("x", String(x));
  rect.setAttribute("y", String(y));
  rect.setAttribute("width", String(size));
  rect.setAttribute("height", String(size));
  if (radius > 0) {
    rect.setAttribute("rx", String(radius));
    rect.setAttribute("ry", String(radius));
  }
  return rect;
}

function makeCircle(x: number, y: number, size: number): SVGCircleElement {
  const circle = document.createElementNS(SVG_NS, "circle");
  const r = size / 2;
  circle.setAttribute("cx", String(x + r));
  circle.setAttribute("cy", String(y + r));
  circle.setAttribute("r", String(r));
  return circle;
}

function makeDiamond(x: number, y: number, size: number): SVGPolygonElement {
  const polygon = document.createElementNS(SVG_NS, "polygon");
  const half = size / 2;
  const cx = x + half;
  const cy = y + half;
  const points = [
    `${cx},${y}`,
    `${x + size},${cy}`,
    `${cx},${y + size}`,
    `${x},${cy}`,
  ].join(" ");
  polygon.setAttribute("points", points);
  return polygon;
}

export function createTile(
  shape: Shape,
  x: number,
  y: number,
  size: number,
): SVGElement {
  switch (shape) {
    case Shape.RoundedRect:
      return makeRect(x, y, size, size * ROUNDED_RECT_RADIUS_RATIO);
    case Shape.Circle:
      return makeCircle(x, y, size);
    case Shape.Diamond:
      return makeDiamond(x, y, size);
    case Shape.Rect:
    default:
      return makeRect(x, y, size);
  }
}
