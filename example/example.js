import { BaseCalendarSettings, drawCalendar } from "../src/index.js";

const svg = document.getElementById("calendar");
const specialDates = {};

const inputs = {
  startDate: document.getElementById("startDate"),
  endDate: document.getElementById("endDate"),
  year: document.getElementById("year"),
  layout: document.getElementById("layout"),
  daySize: document.getElementById("daySize"),
  gap: document.getElementById("gap"),
  daysPerRow: document.getElementById("daysPerRow"),
  startDayOfWeek: document.getElementById("startDayOfWeek"),
};

function buildSettings() {
  return {
    ...BaseCalendarSettings,
    layout: inputs.layout.value,
    startDate: inputs.startDate.value || "01-01",
    endDate: inputs.endDate.value || "12",
    year: inputs.year.value ? parseInt(inputs.year.value) : null,
    daySize: parseInt(inputs.daySize.value) || 22,
    gap: parseInt(inputs.gap.value) || 0,
    daysPerRow: parseInt(inputs.daysPerRow.value) || 21,
    startDayOfWeek: parseInt(inputs.startDayOfWeek.value),
    specialDates: { ...specialDates },
  };
}

function render() {
  drawCalendar(svg, buildSettings());
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

document.getElementById("addSpecial").addEventListener("click", () => {
  const key = specialDateInput.value.trim();
  if (!/^\d{2}-\d{2}$/.test(key)) {
    alert("Use MM-DD format, e.g. 04-15");
    return;
  }
  specialDates[key] = {
    color: specialColorInput.value,
    note: specialNoteInput.value || key,
  };
  specialDateInput.value = "";
  specialNoteInput.value = "";
  refreshSpecialList();
  render();
});

render();
