const SVG_NS = "http://www.w3.org/2000/svg";

export function showDateTooltip(event) {
  const dateInfo = event.target.getAttribute("data-date");
  const x = parseInt(event.target.getAttribute("x"));
  const y = parseInt(event.target.getAttribute("y"));
  const calendar = event.target.ownerSVGElement;
  if (!calendar) return;

  const tooltipGroup = document.createElementNS(SVG_NS, "g");
  tooltipGroup.setAttribute("id", "dateTooltip");

  const background = document.createElementNS(SVG_NS, "rect");
  background.setAttribute("x", x - 5);
  background.setAttribute("y", y - 5);
  background.setAttribute("width", 100);
  background.setAttribute("height", 20);
  background.setAttribute("class", "tooltip-box");

  const text = document.createElementNS(SVG_NS, "text");
  text.setAttribute("x", x);
  text.setAttribute("y", y + 10);
  text.textContent = dateInfo;
  text.setAttribute("class", "tooltip-text");

  tooltipGroup.appendChild(background);
  tooltipGroup.appendChild(text);
  calendar.appendChild(tooltipGroup);
}

export function hideDateTooltip() {
  const tooltip = document.getElementById("dateTooltip");
  if (tooltip) tooltip.remove();
}
