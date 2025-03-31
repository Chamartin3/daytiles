import { Daytiles, Layout, Shape } from "../../dist/index.js";

const PRESET_MONTH = "month";
const PRESET_QUARTER = "quarter";
const PRESET_YEAR = "year";

const SUNDAY = 0;
const SATURDAY = 6;

const svg = document.getElementById("calendar");
const dt = new Daytiles();
dt.onTileClick(({ date, event }) => {
  const note = event.note ? ` — ${event.note}` : "";
  console.log(`Clicked ${date.toDateString()}${note}`);
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
  colorWeekend: $("colorWeekend"),
  shape: $("shape"),
  highlightCurrent: $("highlightCurrent"),
  alternationMode: $("alternationMode"),
  alternationSize: $("alternationSize"),
  highlightWeekend: $("highlightWeekend"),
  showLabels: $("showLabels"),
};

function applySettings() {
  const weekdays = inputs.highlightWeekend.checked
    ? { [SUNDAY]: inputs.colorWeekend.value, [SATURDAY]: inputs.colorWeekend.value }
    : {};
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
      highlight: { weekdays, months: {} },
    },
  });
}

function render() {
  applySettings();
  dt.render(svg);
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
  eventIdsByButton.clear();
  for (const entry of dt.listEvents()) {
    const li = document.createElement("li");

    const swatch = document.createElement("span");
    swatch.className = "swatch";
    swatch.style.background = entry.color;

    const range =
      entry.start === entry.end ? entry.start : `${entry.start} → ${entry.end}`;
    const label = document.createElement("span");
    label.textContent = `${range}${entry.note ? ` — ${entry.note}` : ""}`;

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
    color: eventColorInput.value,
    note: eventNoteInput.value,
  });
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
