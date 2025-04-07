import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = resolve(__dirname, "../docs");
const LAYOUTS_DIR = resolve(DOCS_DIR, "layouts");
const SHAPES_DIR = resolve(DOCS_DIR, "shapes");
mkdirSync(LAYOUTS_DIR, { recursive: true });
mkdirSync(SHAPES_DIR, { recursive: true });

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  pretendToBeVisual: true,
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.SVGElement = dom.window.SVGElement;
globalThis.Element = dom.window.Element;
globalThis.Node = dom.window.Node;
globalThis.getComputedStyle = dom.window.getComputedStyle;
if (typeof globalThis.crypto === "undefined") globalThis.crypto = dom.window.crypto;

// jsdom doesn't compute SVG bbox; stub a reasonable one so render() can size the SVG.
dom.window.SVGElement.prototype.getBBox = function getBBox() {
  let maxX = 0;
  let maxY = 0;
  const tiles = this.querySelectorAll("rect, circle, polygon, path");
  for (const el of tiles) {
    const x = parseFloat(el.getAttribute("x") ?? "0") || 0;
    const y = parseFloat(el.getAttribute("y") ?? "0") || 0;
    const w = parseFloat(el.getAttribute("width") ?? "0") || 0;
    const h = parseFloat(el.getAttribute("height") ?? "0") || 0;
    const r = parseFloat(el.getAttribute("r") ?? "0") || 0;
    const cx = parseFloat(el.getAttribute("cx") ?? "0") || 0;
    const cy = parseFloat(el.getAttribute("cy") ?? "0") || 0;
    maxX = Math.max(maxX, x + w, cx + r);
    maxY = Math.max(maxY, y + h, cy + r);
    const points = el.getAttribute("points");
    if (points) {
      for (const pair of points.trim().split(/\s+/)) {
        const [px, py] = pair.split(",").map(Number);
        if (Number.isFinite(px)) maxX = Math.max(maxX, px);
        if (Number.isFinite(py)) maxY = Math.max(maxY, py);
      }
    }
  }
  return { x: 0, y: 0, width: maxX, height: maxY };
};

const { Daytiles, Layout, Shape, AlternationMode } = await import(
  "../dist/index.js"
);

function makeSvg() {
  return document.createElementNS("http://www.w3.org/2000/svg", "svg");
}

function serialize(svg) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n${svg.outerHTML}`;
}

function writeSample(dir, name, dt) {
  const svg = makeSvg();
  dt.render(svg);
  const path = resolve(dir, `${name}.svg`);
  writeFileSync(path, serialize(svg));
  console.log(`wrote ${path}`);
}

const SHARED_RANGE = { startDate: "2025-01-01", endDate: "2025-03-31" };
const SAMPLE_EVENTS = [
  { start: "2025-01-08", type: "a" },
  { start: "2025-01-09", type: "b" },
  { start: "2025-01-15", type: "a" },
  { start: "2025-01-22", type: "a" },
  { start: "2025-01-22", type: "b" },
  { start: "2025-02-04", type: "a" },
  { start: "2025-02-12", type: "b" },
  { start: "2025-02-12", type: "a" },
  { start: "2025-02-12", type: "a" },
  { start: "2025-02-25", type: "a" },
  { start: "2025-03-03", type: "b" },
  { start: "2025-03-11", type: "a" },
  { start: "2025-03-11", type: "a" },
  { start: "2025-03-19", type: "b" },
  { start: "2025-03-26", type: "a" },
];

function baseColors(overrides = {}) {
  return {
    dayColor: "#f0f3f7",
    highlightCurrent: false,
    pastFade: 1,
    alternation: { mode: AlternationMode.Month, color: "#e3e7ec", size: 1 },
    defaultEventColor: "#1f6feb",
    eventTypeColors: { a: "#1f6feb", b: "#a371f7" },
    ...overrides,
  };
}

// Layouts — each picks a short range that needs the fewest rows it can.
const LAYOUT_VARIANTS = [
  {
    layout: Layout.Month,
    name: "layout-month",
    range: { startDate: "2025-01-01", endDate: "2025-03-31" }, // 3 monthly rows
    daysPerRow: 31,
  },
  {
    layout: Layout.Week,
    name: "layout-week",
    range: { startDate: "2025-01-06", endDate: "2025-01-26" }, // 3 weekly rows
    daysPerRow: 7,
  },
  {
    layout: Layout.Weekday,
    name: "layout-weekday",
    range: { startDate: "2025-01-01", endDate: "2025-02-28" }, // ~9 columns, 7 rows
    daysPerRow: 7,
  },
  {
    layout: Layout.Custom,
    name: "layout-custom",
    range: { startDate: "2025-01-01", endDate: "2025-01-21" }, // 3 rows of 7
    daysPerRow: 7,
  },
];

for (const v of LAYOUT_VARIANTS) {
  const dt = new Daytiles({
    ...v.range,
    layout: v.layout,
    shape: Shape.RoundedRect,
    daySize: 12,
    gap: 2,
    daysPerRow: v.daysPerRow,
    startDayOfWeek: 1,
    showLabels: true,
    colors: baseColors(),
  });
  dt.addEvents(SAMPLE_EVENTS);
  writeSample(LAYOUTS_DIR, v.name, dt);
}

// Shapes
for (const [shape, name] of [
  [Shape.Rect, "shape-rect"],
  [Shape.RoundedRect, "shape-rounded"],
  [Shape.Circle, "shape-circle"],
  [Shape.Diamond, "shape-diamond"],
]) {
  const dt = new Daytiles({
    startDate: "2025-01-06",
    endDate: "2025-01-26",
    layout: Layout.Week,
    shape,
    daySize: 18,
    gap: 4,
    startDayOfWeek: 1,
    showLabels: false,
    colors: baseColors(),
  });
  dt.addEvents([
    { start: "2025-01-08", type: "a" },
    { start: "2025-01-15", type: "b" },
    { start: "2025-01-22", type: "a" },
  ]);
  writeSample(SHAPES_DIR, name, dt);
}


console.log("\ndone.");
