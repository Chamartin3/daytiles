const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;" };

function escapeHtml(s) {
  return s.replace(/[&<>]/g, (c) => HTML_ESCAPES[c]);
}

const TOKEN_RE =
  /("(?:\\.|[^"\\])*"\s*:)|("(?:\\.|[^"\\])*")|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;

const COLOR_RE = /^"(#[0-9a-fA-F]{3,8})"$/;

export function highlightJson(json) {
  return escapeHtml(json).replace(TOKEN_RE, (m, key, str, bool, num) => {
    if (key) return `<span class="tk-key">${key}</span>`;
    if (str) {
      const c = str.match(COLOR_RE);
      if (c) {
        return (
          `<span class="tk-color">` +
          `<span class="tk-swatch" style="background:${c[1]}"></span>` +
          `<span class="tk-str" style="color:${c[1]}">${str}</span>` +
          `</span>`
        );
      }
      return `<span class="tk-str">${str}</span>`;
    }
    if (bool) return `<span class="tk-bool">${bool}</span>`;
    if (num) return `<span class="tk-num">${num}</span>`;
    return m;
  });
}

function ensureCopyButton(pre, getText) {
  const parent = pre.parentElement;
  if (!parent) return;
  let btn = parent.querySelector(":scope > .copy-btn");
  if (!btn) {
    btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-btn";
    btn.textContent = "Copy";
    parent.insertBefore(btn, pre);
  }
  btn.onclick = async () => {
    const text = getText();
    try {
      await navigator.clipboard.writeText(text);
      const original = btn.textContent;
      btn.textContent = "Copied";
      btn.classList.add("copied");
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove("copied");
      }, 1200);
    } catch {
      btn.textContent = "Copy failed";
    }
  };
}

export function renderConfig(el, obj) {
  if (!el) return;
  const plain = JSON.stringify(obj, null, 2);
  el.innerHTML = highlightJson(plain);
  ensureCopyButton(el, () => plain);
}
