import { BaseCalendarSettings, drawCalendar } from "../src/index.js";

const svg = document.getElementById("calendar");
const specialDates = {};

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
    startDate: inputs.startDate.value || "2025-01-01",
    endDate: inputs.endDate.value || "2025-12-31",
    daySize: parseInt(inputs.daySize.value) || 22,
    gap: parseInt(inputs.gap.value) || 0,
    daysPerRow: parseInt(inputs.daysPerRow.value) || 21,
    startDayOfWeek: parseInt(inputs.startDayOfWeek.value),
    showLabels: inputs.showLabels.checked,
    specialDates: { ...specialDates },
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

const specialList = document.getElementById("specialList");
const specialDateInput = document.getElementById("specialDate");
const specialColorInput = document.getElementById("specialColor");
const specialNoteInput = document.getElementById("specialNote");

function refreshSpecialList() {
  specialList.innerHTML = "";
  for (const [key, value] of Object.entries(specialDates)) {
    const li = document.createElement("li");

    const swatch = document.createElement("span");
    swatch.className = "swatch";
    swatch.style.background = value.color || "#ccc";

    const label = document.createElement("span");
    label.textContent = `${key} — ${value.note || ""}`;

    const remove = document.createElement("button");
    remove.className = "remove";
    remove.type = "button";
    remove.textContent = "✕";
    remove.addEventListener("click", () => {
      delete specialDates[key];
      refreshSpecialList();
      render();
    });

    li.append(swatch, label, remove);
    specialList.appendChild(li);
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

document.getElementById("addSpecial").addEventListener("click", () => {
  const value = specialDateInput.value;
  if (!value) {
    alert("Pick a date first");
    return;
  }
  const [, month, day] = value.split("-");
  const key = `${month}-${day}`;
  const note = specialNoteInput.value || key;
  const existing = specialDates[key];
  specialDates[key] = {
    color: specialColorInput.value,
    note: existing?.note ? `${existing.note} • ${note}` : note,
  };
  specialDateInput.value = "";
  specialNoteInput.value = "";
  refreshSpecialList();
  render();
});

render();
