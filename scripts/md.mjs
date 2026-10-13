// Small renderers for the entry pages: the README subset the entries use, and CSS / HTML highlighting.
// No dependencies on purpose; the READMEs stick to headings, paragraphs, lists, tables, quotes and fences.

export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Links written for GitHub (README.md, index.html) point at the matching page on the site.
function href(url) {
  if (/^https?:\/\//.test(url) || url.startsWith("#")) return url;
  return url.replace(/(^|\/)README\.md$/, "$1").replace(/(^|\/)index\.html$/, "$1demo.html");
}

function inline(text) {
  const codes = [];
  let s = text.replace(/`([^`]+)`/g, (_, c) => `\u0000${codes.push(c) - 1}\u0000`);
  s = esc(s)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[\s(])_([^_]+)_(?=[\s).,;:]|$)/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => {
      const ext = /^https?:\/\//.test(url);
      return `<a href="${href(url)}"${ext ? ' rel="noopener"' : ""}>${label}</a>`;
    });
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[i])}</code>`);
}

export function markdown(src, { skipTitle = true } = {}) {
  const lines = src.replace(/\r/g, "").split("\n");
  const out = [];
  let i = 0;
  const para = [];
  const flush = () => { if (para.length) { out.push(`<p>${inline(para.join(" "))}</p>`); para.length = 0; } };
  while (i < lines.length) {
    const line = lines[i];
    if (/^```/.test(line)) {
      flush();
      const lang = line.slice(3).trim();
      const body = [];
      for (i++; i < lines.length && !/^```/.test(lines[i]); i++) body.push(lines[i]);
      i++;
      out.push(codeBlock(body.join("\n"), lang));
      continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      flush();
      if (!(skipTitle && h[1].length === 1)) {
        const level = Math.min(h[1].length + 1, 4);
        out.push(`<h${level}>${inline(h[2])}</h${level}>`);
      }
      i++;
      continue;
    }
    if (/^\|/.test(line)) {
      flush();
      const rows = [];
      for (; i < lines.length && /^\|/.test(lines[i]); i++) rows.push(lines[i]);
      const cells = (r) => r.replace(/^\||\|$/g, "").split(/(?<!\\)\|/).map((c) => c.trim());
      const head = cells(rows[0]);
      const body = rows.slice(2).map(cells);
      out.push(`<div class="table"><table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>${
        body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
      continue;
    }
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      flush();
      const ordered = /^\s*\d+\./.test(line);
      const items = [];
      for (; i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i]); i++) {
        let item = lines[i].replace(/^\s*([-*]|\d+\.)\s+/, "");
        while (i + 1 < lines.length && /^\s{2,}\S/.test(lines[i + 1]) && !/^\s*([-*]|\d+\.)\s+/.test(lines[i + 1])) item += " " + lines[++i].trim();
        items.push(`<li>${inline(item)}</li>`);
      }
      out.push(ordered ? `<ol>${items.join("")}</ol>` : `<ul>${items.join("")}</ul>`);
      continue;
    }
    if (/^>\s?/.test(line)) {
      flush();
      const q = [];
      for (; i < lines.length && /^>\s?/.test(lines[i]); i++) q.push(lines[i].replace(/^>\s?/, ""));
      const kind = /^\[!(\w+)\]/.exec(q[0]);
      if (kind) q.shift();
      out.push(`<blockquote${kind ? ` class="note"` : ""}><p>${inline(q.join(" "))}</p></blockquote>`);
      continue;
    }
    if (/^\s*$/.test(line)) { flush(); i++; continue; }
    if (/^\[Live demo\]/.test(line)) { i++; continue; } // the page itself is the live demo
    para.push(line.trim());
    i++;
  }
  flush();
  return out.join("\n");
}

export function codeBlock(code, lang = "") {
  const body = lang === "css" ? highlightCss(code) : lang === "html" ? highlightHtml(code) : esc(code);
  return `<pre class="code"><code>${body}</code></pre>`;
}

// CSS: comments, preludes (selectors and at-rules), properties, custom properties and values.
export function highlightCss(css) {
  let out = "";
  const parts = css.split(/(\/\*[\s\S]*?\*\/)/);
  for (const part of parts) {
    if (part.startsWith("/*")) { out += `<span class="c">${esc(part)}</span>`; continue; }
    let rest = part;
    while (rest.length) {
      const m = /[{};]/.exec(rest);
      if (!m) { out += value(rest); break; }
      const chunk = rest.slice(0, m.index);
      if (m[0] === "{") {
        const lead = /^\s*/.exec(chunk)[0];
        const sel = chunk.slice(lead.length);
        out += esc(lead) + (sel.trim().startsWith("@") ? atRule(sel) : `<span class="s">${esc(sel)}</span>`) + "{";
      } else {
        out += declaration(chunk) + m[0];
      }
      rest = rest.slice(m.index + 1);
    }
  }
  return out;
}
function atRule(s) {
  const m = /^(@[\w-]+)([\s\S]*)$/.exec(s);
  return m ? `<span class="k">${esc(m[1])}</span>${value(m[2])}` : esc(s);
}
function declaration(d) {
  const m = /^(\s*)([-\w]+)(\s*:)([\s\S]*)$/.exec(d);
  if (!m) return d.trim().startsWith("@") ? atRule(d) : esc(d);
  return `${esc(m[1])}<span class="${m[2].startsWith("--") ? "t" : "p"}">${esc(m[2])}</span>${esc(m[3])}${value(m[4])}`;
}
function value(v) {
  return esc(v).replace(/(--[\w-]+)/g, '<span class="t">$1</span>').replace(/\b(\d*\.?\d+)(ms|s|px|deg|%|em|rem|vw|vh)?\b/g, '<span class="n">$1$2</span>');
}

export function highlightHtml(html) {
  return esc(html)
    .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="c">$1</span>')
    .replace(/(&lt;\/?)([\w-]+)/g, '$1<span class="s">$2</span>')
    .replace(/\s([\w-]+)=(&quot;[^&]*?&quot;)/g, ' <span class="p">$1</span>=<span class="v">$2</span>');
}
