const TOOLTIP_ID = "daytiles-tooltip";

function ensureTooltip() {
  let el = document.getElementById(TOOLTIP_ID);
  if (!el) {
    el = document.createElement("div");
    el.id = TOOLTIP_ID;
    el.className = "tooltip-box";
    Object.assign(el.style, {
      position: "fixed",
      pointerEvents: "none",
      zIndex: "9999",
      display: "none",
      background: "#222",
      color: "#fff",
      border: "1px solid #000",
      borderRadius: "5px",
      padding: "4px 8px",
      fontFamily: "Arial, sans-serif",
      fontSize: "12px",
      whiteSpace: "nowrap",
      boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
    });
    document.body.appendChild(el);
  }
  return el;
}

export function showDateTooltip(event) {
  const date = event.target.getAttribute("data-date");
  const note = event.target.getAttribute("data-note");
  const el = ensureTooltip();
  el.innerHTML = "";
  const dateLine = document.createElement("div");
  dateLine.textContent = date;
  el.appendChild(dateLine);
  if (note) {
    const noteLine = document.createElement("div");
    noteLine.textContent = note;
    noteLine.style.opacity = "0.85";
    noteLine.style.fontStyle = "italic";
    noteLine.style.marginTop = "2px";
    el.appendChild(noteLine);
  }
  el.style.display = "block";
  const rect = event.target.getBoundingClientRect();
  el.style.left = `${rect.right + 8}px`;
  el.style.top = `${rect.top}px`;
}

export function hideDateTooltip() {
  const el = document.getElementById(TOOLTIP_ID);
  if (el) el.style.display = "none";
}
