import { Daytiles, Layout, Shape, AlternationMode } from "../../dist/index.js";
import { renderConfig } from "../utils/config.js";

const START = "2024-04-01";
const END = "2024-06-30";

const COLORS = {
  dayColor: "#f4f6f8",
  highlightCurrent: false,
  pastFade: 1,
  alternation: { mode: AlternationMode.Month, color: "#eaedf1", size: 1 },
  defaultEventColor: "#1f6feb",
  heatmap: true,
  heatmapLow: 0.15,
  heatmapHigh: 0.45,
};

const CONFIG = {
  layout: Layout.Week,
  shape: Shape.RoundedRect,
  startDate: START,
  endDate: END,
  daySize: 26,
  gap: 4,
  startDayOfWeek: 1,
  showLabels: true,
  colors: COLORS,
};

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function isoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const COMPANIES = [
  "Acme", "Globex", "Initech", "Umbrella", "Soylent", "Hooli",
  "Stark", "Wayne", "Wonka", "Tyrell", "Cyberdyne", "Massive",
  "Gringotts", "Pied Piper", "Dunder Mifflin", "Vandelay", "Nakatomi",
];

function generateLeads() {
  const rng = mulberry32(2026_04_01);
  const leads = [];
  const startMs = new Date(START).getTime();
  const endMs = new Date(END).getTime();
  const dayMs = 86_400_000;

  for (let t = startMs; t <= endMs; t += dayMs) {
    const date = new Date(t);
    const dow = date.getDay();
    if (dow === 0 || dow === 6) continue;

    let n = Math.floor(rng() * 3);
    if (rng() < 0.12) n = 3 + Math.floor(rng() * 3);

    for (let i = 0; i < n; i++) {
      const isWhale = rng() < 0.08;
      const weight = isWhale
        ? 100 + Math.floor(rng() * 150)
        : 5 + Math.floor(rng() * 35);
      const company = COMPANIES[Math.floor(rng() * COMPANIES.length)];
      leads.push({
        start: isoDate(date),
        type: "lead",
        weight,
        note: `${company}: $${weight}k`,
      });
    }
  }
  return leads;
}

const dt = new Daytiles(CONFIG);
const leads = generateLeads();
dt.addEvents(leads);

const totalDeals = leads.length;
const totalValue = leads.reduce((s, l) => s + l.weight, 0);
const biggest = leads.reduce((m, l) => (l.weight > m.weight ? l : m), leads[0]);
document.getElementById("stats").innerHTML =
  `<span><strong>${totalDeals}</strong> leads</span>` +
  `<span><strong>$${totalValue}k</strong> total</span>` +
  `<span>biggest: <strong>${biggest.note}</strong></span>`;

const info = document.getElementById("info");
dt.onTileClick(({ date, events }) => {
  if (events.length === 0) {
    info.textContent = `${date.toDateString()}: no leads`;
    return;
  }
  const total = events.reduce((s, e) => s + (e.weight ?? 1), 0);
  const notes = events.map((e) => e.note).filter(Boolean).join(", ");
  info.textContent = `${date.toDateString()}: ${events.length} lead${events.length > 1 ? "s" : ""}, $${total}k: ${notes}`;
});

dt.render(document.getElementById("calendar"));
renderConfig(document.getElementById("config"), CONFIG);
