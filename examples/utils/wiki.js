export async function loadWiki(slug, target) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`;
  const res = await fetch(url);
  if (!res.ok) {
    target.innerHTML = `<p>Could not load article.</p>`;
    target.classList.add("loaded");
    return;
  }
  const data = await res.json();
  const thumb = data.thumbnail?.source
    ? `<img src="${data.thumbnail.source}" alt="">`
    : "";
  const link = `https://en.wikipedia.org/wiki/${slug}`;
  target.innerHTML = `
    <h2>${data.title}</h2>
    ${thumb}
    <div class="extract">${data.extract_html ?? ""}</div>
    <a class="more" href="${link}" target="_blank" rel="noopener">Read on Wikipedia →</a>
  `;
  target.classList.add("loaded");
}

export function bindWiki(dt, { wiki, info }) {
  dt.onTileClick(({ date, event }) => {
    if (info) {
      info.textContent = event.note
        ? `${date.toDateString()} — ${event.note}`
        : date.toDateString();
    }
    if (event.wiki && wiki) loadWiki(event.wiki, wiki);
  });
}
