import { Daytiles, Layout, Shape, AlternationMode } from "../../dist/index.js";

const dt = new Daytiles({
  layout: Layout.Custom,
  shape: Shape.Rect,
  startDate: "1789-05-01",
  endDate: "1799-11-30",
  daySize: 10,
  gap: 1,
  daysPerRow: 90,
  startDayOfWeek: 0,
  showLabels: false,
  colors: {
    current: "#0055a4",
    fadePastDates: false,
    pastDay: "#dfe7f7",
    futureDay: "#dfe7f7",
    alternation: { mode: AlternationMode.Year, color: "#a8b8d9", size: 1 },
    highlight: { weekdays: {}, months: {} },
    eventTypeColors: {
      political: "#0055a4",
      uprising: "#6e6aaa",
      terror: "#c94a6e",
      war: "#ef4135",
    },
  },
});

const events = await fetch("./events.json").then((r) => r.json());
for (const evt of events) dt.addEvent(evt);

const info = document.getElementById("info");
const wiki = document.getElementById("wiki");

async function loadWiki(slug) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`;
  const res = await fetch(url);
  if (!res.ok) {
    wiki.innerHTML = `<p>Could not load article.</p>`;
    wiki.classList.add("loaded");
    return;
  }
  const data = await res.json();
  const thumb = data.thumbnail?.source
    ? `<img src="${data.thumbnail.source}" alt="">`
    : "";
  const link = `https://en.wikipedia.org/wiki/${slug}`;
  wiki.innerHTML = `
    <h2>${data.title}</h2>
    ${thumb}
    <div class="extract">${data.extract_html ?? ""}</div>
    <a class="more" href="${link}" target="_blank" rel="noopener">Read on Wikipedia →</a>
  `;
  wiki.classList.add("loaded");
}

dt.onTileClick(({ date, event }) => {
  info.textContent = event.note
    ? `${date.toDateString()} — ${event.note}`
    : date.toDateString();
  if (event.wiki) loadWiki(event.wiki);
});

const svg = document.getElementById("calendar");
dt.render(svg);
const bbox = svg.getBBox();
svg.setAttribute("width", Math.ceil(bbox.x + bbox.width));
svg.setAttribute("height", Math.ceil(bbox.y + bbox.height));
