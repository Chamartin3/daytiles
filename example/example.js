import { BaseCalendarSettings, drawCalendar } from "../src/index.js";

const svg = document.getElementById("calendar");
const eventEntries = [];
const events = {};

function isoDateOnly(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function rebuildEvents() {
  for (const k of Object.keys(events)) delete events[k];
  for (const entry of eventEntries) {
    const cursor = new Date(entry.start);
    const end = new Date(entry.end);
    while (cursor <= end) {
      const month = String(cursor.getMonth() + 1).padStart(2, "0");
      const day = String(cursor.getDate()).padStart(2, "0");
      const key = `${month}-${day}`;
      const note = entry.note || key;
      const existing = events[key];
      events[key] = {
        color: entry.color,
        note: existing?.note ? `${existing.note} • ${note}` : note,
      };
      cursor.setDate(cursor.getDate() + 1);
    }
  }
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
  colorPast: $("colorPast"),
  colorFuture: $("colorFuture"),
  colorAlt: $("colorAlt"),
  colorWeekend: $("colorWeekend"),
  pastMode: $("pastMode"),
  highlightCurrent: $("highlightCurrent"),
  alternateMonths: $("alternateMonths"),
  highlightWeekend: $("highlightWeekend"),
  showLabels: $("showLabels"),
};

function buildSettings() {
  const weekdays = inputs.highlightWeekend.checked
    ? { 0: inputs.colorWeekend.value, 6: inputs.colorWeekend.value }
    : {};
  return {
    ...BaseCalendarSettings,
    layout: inputs.layout.value,
    startDate: inputs.startDate.value,
    endDate: inputs.endDate.value,
    daySize: parseInt(inputs.daySize.value) || 22,
    gap: parseInt(inputs.gap.value) || 0,
    daysPerRow: parseInt(inputs.daysPerRow.value) || 21,
    startDayOfWeek: parseInt(inputs.startDayOfWeek.value),
    showLabels: inputs.showLabels.checked,
    events: { ...events },
    colors: {
      current: inputs.colorCurrent.value,
      pastDay: inputs.colorPast.value,
      futureDay: inputs.colorFuture.value,
      alternateMonths: inputs.alternateMonths.checked,
      alternateMonthColor: inputs.colorAlt.value,
      highlightCurrent: inputs.highlightCurrent.checked,
      fadePastDates: inputs.pastMode.value === "fade",
      solidPastColor: inputs.pastMode.value === "solid",
      highlight: { weekdays, months: {} },
    },
  };
}

function render() {
  drawCalendar(svg, buildSettings());
  const bbox = svg.getBBox();
  const w = Math.ceil(bbox.x + bbox.width);
  const h = Math.ceil(bbox.y + bbox.height);
  svg.setAttribute("width", w);
  svg.setAttribute("height", h);
}

Object.values(inputs).forEach((el) => {
  el.addEventListener("input", render);
  el.addEventListener("change", render);
});

const eventList = document.getElementById("eventList");
const eventStartInput = document.getElementById("eventStart");
const eventEndInput = document.getElementById("eventEnd");
const eventColorInput = document.getElementById("eventColor");
const eventNoteInput = document.getElementById("eventNote");

function refreshEventList() {
  eventList.innerHTML = "";
  for (const entry of eventEntries) {
    const li = document.createElement("li");

    const swatch = document.createElement("span");
    swatch.className = "swatch";
    swatch.style.background = entry.color;

    const range =
      entry.start === entry.end
        ? entry.start
        : `${entry.start} → ${entry.end}`;
    const label = document.createElement("span");
    label.textContent = `${range}${entry.note ? ` — ${entry.note}` : ""}`;

    const remove = document.createElement("button");
    remove.className = "remove";
    remove.type = "button";
    remove.textContent = "✕";
    remove.addEventListener("click", () => {
      const idx = eventEntries.indexOf(entry);
      if (idx >= 0) eventEntries.splice(idx, 1);
      rebuildEvents();
      refreshEventList();
      render();
    });

    li.append(swatch, label, remove);
    eventList.appendChild(li);
  }
}

function isoDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function applyPreset(name) {
  const today = new Date();
  let start, end;
  switch (name) {
    case "month":
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;
    case "quarter": {
      const q = Math.floor(today.getMonth() / 3);
      start = new Date(today.getFullYear(), q * 3, 1);
      end = new Date(today.getFullYear(), q * 3 + 3, 0);
      break;
    }
    case "year":
      start = new Date(today.getFullYear(), 0, 1);
      end = new Date(today.getFullYear(), 11, 31);
      break;
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
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (endDate < startDate) {
    alert("End date must be on or after start date");
    return;
  }
  eventEntries.push({
    start: isoDateOnly(startDate),
    end: isoDateOnly(endDate),
    color: eventColorInput.value,
    note: eventNoteInput.value,
  });
  rebuildEvents();
  eventStartInput.value = "";
  eventEndInput.value = "";
  eventNoteInput.value = "";
  refreshEventList();
  render();
});

const currentYear = new Date().getFullYear();
inputs.startDate.value = `${currentYear}-01-01`;
inputs.endDate.value = `${currentYear}-12-31`;

render();
