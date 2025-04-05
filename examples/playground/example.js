import { Daytiles, Layout, Shape } from "../../dist/index.js?v=3";
import { renderConfig } from "../utils/config.js";

const PRESET_MONTH = "month";
const PRESET_QUARTER = "quarter";
const PRESET_YEAR = "year";

const SUNDAY = 0;
const SATURDAY = 6;

const svg = document.getElementById("calendar");
const dt = new Daytiles();
dt.onTileClick(({ date, events }) => {
  const notes = events.map((e) => e.note).filter(Boolean).join(" • ");
  const suffix = notes ? `: ${notes}` : "";
  console.log(`Clicked ${date.toDateString()} (${events.length})${suffix}`);
});
const eventIdsByButton = new Map();

function isoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const $ = (id) => document.getElementById(id);
const inputs = {
  startDate: $("startDate"),
  endDate: $("endDate"),
  layout: $("layout"),
  daySize: $("daySize"),
  gap: $("gap"),
  daysPerRow: $("daysPerRow"),
  startDayOfWeek: $("startDayOfWeek"),
  colorCurrent: $("colorCurrent"),
  dayColor: $("dayColor"),
  pastFade: $("pastFade"),
  futureFade: $("futureFade"),
  colorAlternation: $("colorAlternation"),
  highlightColor: $("highlightColor"),
  shape: $("shape"),
  highlightCurrent: $("highlightCurrent"),
  alternationMode: $("alternationMode"),
  alternationSize: $("alternationSize"),
  showLabels: $("showLabels"),
  heatmap: $("heatmap"),
  heatmapLow: $("heatmapLow"),
  heatmapHigh: $("heatmapHigh"),
  defaultEventColor: $("defaultEventColor"),
};

let eventTypes = [];
const typeListEl = $("typeList");
const typeNameInput = $("typeName");
const typeColorInput = $("typeColor");
const eventTypeSelect = $("eventType");

function eventTypeColorsMap() {
  const out = {};
  for (const t of eventTypes) out[t.name] = t.color;
  return out;
}

function refreshTypeList() {
  typeListEl.innerHTML = "";
  for (const t of eventTypes) {
    const li = document.createElement("li");
    const swatch = document.createElement("span");
    swatch.className = "swatch";
    swatch.style.background = t.color;
    const label = document.createElement("span");
    label.textContent = t.name;
    const remove = document.createElement("button");
    remove.className = "remove";
    remove.type = "button";
    remove.textContent = "✕";
    remove.addEventListener("click", () => {
      eventTypes = eventTypes.filter((x) => x.name !== t.name);
      refreshTypeList();
      refreshTypeOptions();
      render();
    });
    li.append(swatch, label, remove);
    typeListEl.appendChild(li);
  }
}

function refreshTypeOptions() {
  const current = eventTypeSelect.value;
  eventTypeSelect.innerHTML = "";
  const blank = document.createElement("option");
  blank.value = "";
  blank.textContent = "(default)";
  eventTypeSelect.appendChild(blank);
  for (const t of eventTypes) {
    const opt = document.createElement("option");
    opt.value = t.name;
    opt.textContent = t.name;
    eventTypeSelect.appendChild(opt);
  }
  if ([...eventTypeSelect.options].some((o) => o.value === current)) {
    eventTypeSelect.value = current;
  }
}

const highlightWeekdays = new Set([SUNDAY, SATURDAY]);
const highlightMonths = new Set();

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function buildToggles(containerId, names, set) {
  const container = $(containerId);
  container.innerHTML = "";
  names.forEach((label, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    if (set.has(idx)) btn.classList.add("active");
    btn.addEventListener("click", () => {
      if (set.has(idx)) set.delete(idx);
      else set.add(idx);
      btn.classList.toggle("active");
      render();
    });
    container.appendChild(btn);
  });
}

function applySettings() {
  const color = inputs.highlightColor.value;
  const weekdays = {};
  for (const d of highlightWeekdays) weekdays[d] = color;
  const months = {};
  for (const m of highlightMonths) months[m] = color;
  dt.update({
    layout: inputs.layout.value,
    startDate: inputs.startDate.value,
    endDate: inputs.endDate.value,
    daySize: parseInt(inputs.daySize.value) || 22,
    gap: parseInt(inputs.gap.value) || 0,
    daysPerRow: parseInt(inputs.daysPerRow.value) || 21,
    startDayOfWeek: parseInt(inputs.startDayOfWeek.value),
    showLabels: inputs.showLabels.checked,
    shape: inputs.shape.value,
    colors: {
      current: inputs.colorCurrent.value,
      dayColor: inputs.dayColor.value,
      pastFade: parseFloat(inputs.pastFade.value),
      futureFade: parseFloat(inputs.futureFade.value),
      alternation: {
        mode: inputs.alternationMode.value,
        color: inputs.colorAlternation.value,
        size: parseInt(inputs.alternationSize.value) || 7,
      },
      highlightCurrent: inputs.highlightCurrent.checked,
      highlight: { weekdays, months },
      heatmap: inputs.heatmap.checked,
      heatmapLow: parseFloat(inputs.heatmapLow.value),
      heatmapHigh: parseFloat(inputs.heatmapHigh.value),
      defaultEventColor: inputs.defaultEventColor.value,
      eventTypeColors: eventTypeColorsMap(),
    },
  });
}

function syncAlternationVisibility() {
  const mode = inputs.alternationMode.value;
  document.getElementById("alternationColorLabel").hidden = mode === "none";
  document.getElementById("alternationSizeLabel").hidden = mode !== "custom";
}

function render() {
  syncAlternationVisibility();
  applySettings();
  dt.render(svg);
  const { events: _drop, ...cfg } = dt.getSettings();
  renderConfig(document.getElementById("config"), cfg);
}

Object.values(inputs).forEach((el) => {
  el.addEventListener("input", render);
  el.addEventListener("change", render);
});

const eventList = document.getElementById("eventList");
const eventStartInput = document.getElementById("eventStart");
const eventEndInput = document.getElementById("eventEnd");
const eventNoteInput = document.getElementById("eventNote");

function refreshEventList() {
  eventList.innerHTML = "";
  eventIdsByButton.clear();
  for (const entry of dt.listEvents()) {
    const li = document.createElement("li");

    const typeColor = entry.type
      ? eventTypes.find((t) => t.name === entry.type)?.color
      : undefined;
    const swatch = document.createElement("span");
    swatch.className = "swatch";
    swatch.style.background = typeColor ?? inputs.defaultEventColor.value;

    const range =
      entry.start === entry.end ? entry.start : `${entry.start} → ${entry.end}`;
    const typeLabel = entry.type ? ` [${entry.type}]` : "";
    const label = document.createElement("span");
    label.textContent = `${range}${typeLabel}${entry.note ? `: ${entry.note}` : ""}`;

    const remove = document.createElement("button");
    remove.className = "remove";
    remove.type = "button";
    remove.textContent = "✕";
    eventIdsByButton.set(remove, entry.id);
    remove.addEventListener("click", () => {
      const id = eventIdsByButton.get(remove);
      if (id) dt.removeEvent(id);
      refreshEventList();
      render();
    });

    li.append(swatch, label, remove);
    eventList.appendChild(li);
  }
}

function applyPreset(name) {
  const today = new Date();
  const year = today.getFullYear();
  let start, end;
  switch (name) {
    case PRESET_MONTH:
      start = new Date(year, today.getMonth(), 1);
      end = new Date(year, today.getMonth() + 1, 0);
      break;
    case PRESET_QUARTER: {
      const q = Math.floor(today.getMonth() / 3);
      start = new Date(year, q * 3, 1);
      end = new Date(year, q * 3 + 3, 0);
      break;
    }
    case PRESET_YEAR:
      start = new Date(year, 0, 1);
      end = new Date(year, 11, 31);
      break;
    default:
      return;
  }
  inputs.startDate.value = isoDate(start);
  inputs.endDate.value = isoDate(end);
  render();
}

document.querySelectorAll(".presets button").forEach((btn) => {
  btn.addEventListener("click", () => applyPreset(btn.dataset.preset));
});

document.getElementById("addEvent").addEventListener("click", () => {
  const start = eventStartInput.value;
  if (!start) {
    alert("Pick a start date first");
    return;
  }
  const end = eventEndInput.value || start;
  if (new Date(end) < new Date(start)) {
    alert("End date must be on or after start date");
    return;
  }
  dt.addEvent({
    start,
    end,
    type: eventTypeSelect.value || undefined,
    note: eventNoteInput.value,
  });
  eventStartInput.value = "";
  eventEndInput.value = "";
  eventNoteInput.value = "";
  refreshEventList();
  render();
});

document.getElementById("addType").addEventListener("click", () => {
  const name = typeNameInput.value.trim();
  if (!name) {
    alert("Type name is required");
    return;
  }
  if (eventTypes.some((t) => t.name === name)) {
    alert("Type already exists");
    return;
  }
  eventTypes.push({ name, color: typeColorInput.value });
  typeNameInput.value = "";
  refreshTypeList();
  refreshTypeOptions();
  render();
});

const currentYear = new Date().getFullYear();
inputs.startDate.value = `${currentYear}-01-01`;
inputs.endDate.value = `${currentYear}-12-31`;

function seedDefaults() {
  eventTypes = [
    { name: "work", color: "#5577ff" },
    { name: "travel", color: "#ff9933" },
    { name: "health", color: "#33aa66" },
  ];
  refreshTypeList();
  refreshTypeOptions();
  refreshEventList();
}

buildToggles("highlightWeekdays", WEEKDAY_NAMES, highlightWeekdays);
buildToggles("highlightMonths", MONTH_NAMES, highlightMonths);

seedDefaults();
render();
