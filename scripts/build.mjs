// Builds the gallery site into dist/. Runs the check gate first; any problem stops the build.
//   dist/index.html              the gallery
//   dist/<kind>/<slug>/index.html the entry page (stage, timeline, README, CSS)
//   dist/<kind>/<slug>/demo.html  the bare demo (the entry's own index.html), shown in the stage iframe
import { rmSync, mkdirSync, cpSync, readFileSync, writeFileSync, existsSync, statSync, renameSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { check } from "./check.mjs";
import { loadEntries, ROOT } from "./entries.mjs";
import { SITE_URL, REPO_URL } from "./site.mjs";
import { esc, markdown, codeBlock } from "./md.mjs";
import { easingTokens, pathFor, py, px, PLOT } from "./curves.mjs";

const problems = check();
if (problems.length) {
  console.error(problems.map((p) => `x ${p}`).join("\n"));
  process.exit(1);
}

const DIST = join(ROOT, "dist");
const BUNDLE_BUDGET_GZ = 10 * 1024; // motion.css must stay small enough to drop into any page
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST);
for (const p of ["tokens.css", "play.js", "demo.css", "fonts", "patterns", "templates", "LICENSE"]) cpSync(join(ROOT, p), join(DIST, p), { recursive: true });
cpSync(join(ROOT, "site/public"), DIST, { recursive: true });

const entries = loadEntries();
const patterns = entries.filter((e) => e.kind === "pattern");
const templates = entries.filter((e) => e.kind === "template");

// motion.css: tokens + every pattern, one file.
const bundle = [
  `/* motion-patterns v${pkg.version} | MIT | ${REPO_URL} */`,
  readFileSync(join(ROOT, "tokens.css"), "utf8"),
  ...patterns.map((e) => `/* ${e.slug} */\n` + readFileSync(join(e.path, "style.css"), "utf8").replace(/\.\.\/\.\.\/fonts\//g, "fonts/")),
].join("\n");
writeFileSync(join(DIST, "motion.css"), bundle);
const gz = gzipSync(bundle).length;
if (gz > BUNDLE_BUDGET_GZ) {
  console.error(`x motion.css is ${gz} bytes gzipped, over the ${BUNDLE_BUDGET_GZ} byte budget`);
  process.exit(1);
}

// Each template also gets bundle.css: tokens + the patterns it uses + its own CSS, so Copy CSS gives a
// complete, working stylesheet. Font paths are rewritten for a file that sits next to a fonts/ folder.
const patternCss = (slug) => readFileSync(join(ROOT, "patterns", slug, "style.css"), "utf8");
for (const t of templates) {
  const parts = [
    `/* ${t.meta.name} | motion-patterns | MIT | ${REPO_URL}/tree/main/${t.rel} */`,
    readFileSync(join(ROOT, "tokens.css"), "utf8"),
    ...t.meta.uses.map((u) => `/* pattern: ${u} */\n` + patternCss(u)),
    `/* template */\n` + readFileSync(join(t.path, "style.css"), "utf8"),
  ];
  writeFileSync(join(DIST, t.rel, "bundle.css"), parts.join("\n").replace(/\.\.\/\.\.\/fonts\//g, "fonts/"));
}

// The entry's own index.html becomes demo.html; its folder index becomes the entry page.
for (const e of entries) renameSync(join(DIST, e.rel, "index.html"), join(DIST, e.rel, "demo.html"));

const CATEGORY = { entry: "Entrances", emphasis: "Emphasis", loop: "Loops", scroll: "Scroll", scene: "Scenes", type: "Type" };
const TRIGGER = { load: "Plays on load", "in-view": "Plays in view", hover: "Plays on hover", scroll: "Follows scroll", loop: "Loops" };
const REDUCED = { "final-state": "Shows the finished state", static: "Holds still" };
const TECH = { css: "CSS", svg: "SVG", js: "JavaScript", canvas: "Canvas", webgl: "WebGL", "variable-font": "Variable font" };
const byName = Object.fromEntries(entries.map((e) => [e.slug, e]));
const kb = (n) => (n / 1024).toFixed(1);

function credit(m) {
  if (m.relation === "original") return "";
  const label = { port: "Port of", recreation: "Recreation of", "inspired-by": "Inspired by" }[m.relation];
  return `${label} <a href="${esc(m.source.url)}" rel="noopener">${esc(m.source.title)}</a> by ${esc(m.source.author)}`;
}
const copyPath = (e) => `/${e.rel}/${e.kind === "template" ? "bundle" : "style"}.css`;
const jsFiles = (e) => readdirSync(e.path).filter((f) => f.endsWith(".js"));

// The spacing-chart mark: a ball eased into place, each frame closer to the last.
const MARK = `<svg class="mark-svg" viewBox="0 0 40 16" aria-hidden="true"><circle cx="3" cy="8" r="2" fill="currentColor" opacity=".2"/><circle cx="14" cy="8" r="2.4" fill="currentColor" opacity=".32"/><circle cx="22.5" cy="8" r="2.8" fill="currentColor" opacity=".48"/><circle cx="28.5" cy="8" r="3.2" fill="currentColor" opacity=".66"/><circle cx="34" cy="8" r="4.4" class="mark-key"/></svg>`;

function head({ title, description, path, extra = "" }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${SITE_URL}${path}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${SITE_URL}${path}">
<meta property="og:type" content="website">
<meta property="og:image" content="${SITE_URL}/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#eef2f7">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/anybody-vf.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/host-grotesk-vf.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/tokens.css">
<link rel="stylesheet" href="/site.css">${extra}
<script src="/play.js"></script>
<script src="/studio.js" defer></script>
</head>`;
}

function bar(current = "") {
  const link = (href, label, key) => `<a href="${href}"${current === key ? ' aria-current="page"' : ""}>${label}</a>`;
  return `<header class="bar">
  <a class="brand" href="/">${MARK}<span>Motion patterns</span></a>
  <nav class="bar-nav" aria-label="Sections">
    ${link("/#templates", "Templates", "templates")}
    ${link("/#patterns", "Patterns", "patterns")}
    ${link("/#curves", "Curves", "curves")}
    <a href="${REPO_URL}" rel="noopener">GitHub</a>
  </nav>
  <a class="btn btn-ink bar-get" href="/motion.css" download>Get motion.css</a>
</header>`;
}

// The timeline under every stage. studio.js reads the stage's running animations and draws the rows.
function sheet(id, { trigger = "", label = "" } = {}) {
  return `<div class="sheet" data-sheet="${id}"${trigger ? ` data-trigger="${trigger}"` : ""} aria-label="${esc(label)} timeline" role="group">
  <div class="sheet-controls">
    <button type="button" class="sheet-btn" data-act="toggle" aria-label="Pause"><svg viewBox="0 0 16 16" aria-hidden="true"><path class="i-pause" d="M4 3h3v10H4zM9 3h3v10H9z"/><path class="i-play" d="M4 2.5v11l9-5.5z"/></svg></button>
    <button type="button" class="sheet-btn" data-act="replay" aria-label="Replay from the start"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8a4.5 4.5 0 1 0 1.4-3.3M3.5 2.5v2.6h2.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    <button type="button" class="sheet-speed" data-act="speed" aria-pressed="false" title="Play at quarter speed">0.25&times;</button>
    <output class="sheet-time" aria-live="off">0.00s</output>
  </div>
  <div class="sheet-body"><p class="sheet-empty">Timeline loads with the demo.</p></div>
</div>`;
}

function stage(e, { lazy = true, size = "" } = {}) {
  const m = e.meta;
  // Gallery templates show their poster until the visitor stops on them; only then does the live page load.
  const poster = lazy && e.kind === "template" && existsSync(join(e.path, "poster.jpg"));
  return `<div class="stage stage-${e.kind}${size}${poster ? " has-poster" : ""}" data-stage="${e.slug}">
  ${poster ? `<img class="stage-poster" src="/${e.rel}/poster.jpg" alt="" width="1280" height="720" loading="lazy" decoding="async">\n  ` : ""}${lazy
    // In the gallery studio.js loads each demo once it is near the screen and the headline has landed,
    // so sixteen documents never start on the same thread at once.
    ? `<iframe data-src="/${e.rel}/demo.html" title="${esc(m.name)} demo" data-for="${e.slug}"${poster ? " data-live" : ""}></iframe>
  <noscript><a class="stage-open" href="/${e.rel}/demo.html">Open the ${esc(m.name)} demo</a></noscript>`
    : `<iframe src="/${e.rel}/demo.html" title="${esc(m.name)} demo" data-for="${e.slug}"></iframe>`}
</div>`;
}

function chips(m) {
  return `<ul class="chips" role="list"><li>${TRIGGER[m.trigger]}</li>${m.tech.map((t) => `<li>${TECH[t]}</li>`).join("")}</ul>`;
}

function templateBlock(e) {
  const m = e.meta;
  const uses = m.uses.map((u) => `<a href="/patterns/${u}/">${esc(byName[u]?.meta.name || u)}</a>`).join(", ");
  return `<article class="reel" id="${e.slug}">
  <div class="reel-media">
    ${stage(e)}
    ${sheet(e.slug, { trigger: m.trigger, label: m.name })}
  </div>
  <div class="reel-info">
    <h3 class="entry-name"><a href="/${e.rel}/">${esc(m.name)}</a></h3>
    <p class="entry-sum">${esc(m.summary)}</p>
    <p class="uses">Built from ${uses}.</p>
    ${m.relation === "original" ? "" : `<p class="credit">${credit(m)}</p>`}
    ${chips(m)}
    <div class="actions">
      <a class="btn btn-ink" href="/${e.rel}/">Open</a>
      <button type="button" class="btn" data-copy="${copyPath(e)}" data-name="${esc(m.name)}">Copy CSS</button>
      <a class="btn btn-quiet" href="${REPO_URL}/tree/main/${e.rel}" rel="noopener">Source</a>
    </div>
  </div>
</article>`;
}

function patternBlock(e) {
  const m = e.meta;
  return `<article class="spec" id="${e.slug}" data-cat="${m.category}">
  ${stage(e)}
  ${sheet(e.slug, { trigger: m.trigger, label: m.name })}
  <div class="spec-info">
    <h3 class="entry-name"><a href="/${e.rel}/">${esc(m.name)}</a></h3>
    <p class="entry-sum">${esc(m.summary)}</p>
    ${m.relation === "original" ? "" : `<p class="credit">${credit(m)}</p>`}
    <div class="spec-foot">
      ${chips(m)}
      <div class="actions">
        <button type="button" class="btn btn-small" data-copy="${copyPath(e)}" data-name="${esc(m.name)}">Copy CSS</button>
        <a class="btn btn-small btn-quiet" href="/${e.rel}/">Open</a>
      </div>
    </div>
  </div>
</article>`;
}

// Hero: each line is drawn once as the key frame and five more times as onion-skin ghosts, each ghost
// holding the pose of an earlier moment (a fractional iteration count with fill: forwards).
function onion(word, cls) {
  const ghosts = [1, 2, 3, 4, 5].map((i) => `<span class="g g${i}">${word}</span>`).join("");
  return `<span class="ln ${cls}" aria-hidden="true">${ghosts}<span class="k">${word}</span></span>`;
}

const curves = easingTokens();
const durations = [...readFileSync(join(ROOT, "tokens.css"), "utf8").matchAll(/(--dur-[\w-]+)\s*:\s*([\d.]+m?s)\s*;\s*\/\*\s*([^*]*?)\s*\*\//g)].map((m) => ({ name: m[1], value: m[2], note: m[3] }));
// Per-curve classes for the plots, written to a file (the CSP blocks style="" and <style>).
writeFileSync(join(DIST, "curves.css"), [
  `/* generated by scripts/build.mjs from tokens.css */`,
  `.plot { --y0: ${((py(0) / PLOT.H) * 100).toFixed(2)}%; --y1: ${((py(1) / PLOT.H) * 100).toFixed(2)}%; }`,
  ...curves.map((c) => `.curve-${c.name.slice(2)} { --curve: var(${c.name}); }`),
].join("\n") + "\n");

function curveBlock(c) {
  const grid = [0, 1].map((v) => `<line x1="0" x2="${PLOT.W}" y1="${py(v)}" y2="${py(v)}" class="plot-base"/>`).join("") +
    [0.25, 0.5, 0.75].map((v) => `<line x1="${px(v)}" x2="${px(v)}" y1="0" y2="${PLOT.H}" class="plot-grid"/>`).join("");
  return `<figure class="curve curve-${c.name.slice(2)}">
  <div class="plot">
    <svg viewBox="0 0 ${PLOT.W} ${PLOT.H}" preserveAspectRatio="none" aria-hidden="true">${grid}<path d="${pathFor(c.points)}" class="plot-line" vector-effect="non-scaling-stroke"/></svg>
    <span class="plot-x"><span class="plot-y"><span class="plot-dot"></span></span></span>
  </div>
  <div class="lane" aria-hidden="true"><span class="lane-run"><span class="lane-ball"></span></span></div>
  <figcaption><code>${c.name}</code><span>${esc(c.note)}</span></figcaption>
</figure>`;
}

const facts = `${patterns.length} patterns, ${templates.length} templates, one ${kb(gz)} KB file`;
const cats = [...new Set(patterns.map((e) => e.meta.category))];

const home = `${head({ title: "Motion patterns: web motion you can scrub, read and copy", description: "An open collection of web motion: CSS patterns and full templates, each with a live timeline you can scrub, a reduced-motion state and a credit to its source. No dependencies, MIT.", path: "/", extra: '\n<link rel="stylesheet" href="/curves.css">' })}
<body class="home">
<a class="skip" href="#templates">Skip to the collection</a>
${bar()}
<main>
<section class="hero" aria-labelledby="hero-h">
  <div class="hero-stage" data-hero>
    <span class="pegs" aria-hidden="true"><i></i><i></i><i></i></span>
    <h1 id="hero-h" class="onion"><span class="sr-only">Motion patterns</span>${onion("Motion", "ln-a")}${onion("patterns", "ln-b")}</h1>
    <div class="hero-copy">
      <p class="hero-lede">Web motion you can scrub, read and copy. Every pattern and template plays live with its own timeline, has a reduced-motion state, and credits where it came from.</p>
      <div class="hero-actions">
        <a class="btn btn-key" href="/motion.css" download>Get motion.css</a>
        <a class="btn" href="#patterns">Browse patterns</a>
      </div>
      <p class="hero-facts">${facts}. No dependencies, MIT.</p>
    </div>
  </div>
  ${sheet("hero", { label: "Hero" })}
  <p class="hero-note">This is the timeline of the headline above. Drag across it to scrub, or slow it to a quarter. Every entry below has one.</p>
</section>

<section class="section" id="templates" aria-labelledby="templates-h">
  <header class="section-head">
    <h2 id="templates-h">Templates</h2>
    <p>Finished scenes built from the patterns. Open one to see it full size, at phone width, with its CSS.</p>
  </header>
  <div class="reels">
${templates.map(templateBlock).join("\n")}
  </div>
</section>

<section class="section" id="patterns" aria-labelledby="patterns-h">
  <header class="section-head">
    <h2 id="patterns-h">Patterns</h2>
    <p>One move each, a class and a keyframe on shared tokens. Copy one, or take them all in <a href="/motion.css" download>motion.css</a>.</p>
  </header>
  <nav class="filters" aria-label="Filter patterns">
    <button type="button" data-filter="all" aria-pressed="true">All <span>${patterns.length}</span></button>
${cats.map((c) => `    <button type="button" data-filter="${c}" aria-pressed="false">${CATEGORY[c]} <span>${patterns.filter((e) => e.meta.category === c).length}</span></button>`).join("\n")}
  </nav>
  <div class="specs">
${patterns.map(patternBlock).join("\n")}
  </div>
</section>

<section class="section" id="curves" aria-labelledby="curves-h">
  <header class="section-head">
    <h2 id="curves-h">Curves</h2>
    <p>Every entry moves on these ${curves.length} curves and ${durations.length} durations from <a href="/tokens.css">tokens.css</a>. The dot runs the curve, the ball below runs the same curve along a line.</p>
  </header>
  <div class="curves">
    <label class="curves-pause"><input type="checkbox"> Pause the curves</label>
    <div class="curve-grid">
${curves.map(curveBlock).join("\n")}
    </div>
    <dl class="durations">
${durations.map((d) => `      <div><dt><code>${d.name}</code></dt><dd><strong>${d.value}</strong> ${esc(d.note)}</dd></div>`).join("\n")}
    </dl>
  </div>
</section>

<section class="section use" id="use" aria-labelledby="use-h">
  <header class="section-head">
    <h2 id="use-h">Use one in a minute</h2>
    <p>Link the file, add a class. <code>play.js</code> is only needed for patterns that wait until they are in view.</p>
  </header>
  ${codeBlock(`<link rel="stylesheet" href="motion.css">
<script src="play.js"></script>

<h1>Hello</h1>
<p class="rise">The heading is already there. This line rises in.</p>`, "html")}
  <ul class="rules" role="list">
    <li><strong>Text renders first.</strong> No heading or main image waits at zero opacity.</li>
    <li><strong>Reduced motion shows the finished state,</strong> never a blank one.</li>
    <li><strong>Works without JavaScript.</strong> Hidden start states apply only once play.js runs.</li>
    <li><strong>Pausable.</strong> Anything that moves for more than five seconds has a pause control.</li>
  </ul>
</section>
</main>

${foot()}
<p class="sr-only" role="status" aria-live="polite" id="status"></p>
</body>
</html>
`;
writeFileSync(join(DIST, "index.html"), home);

function foot() {
  return `<footer class="foot">
  <p class="foot-mark">${MARK}<span>Motion patterns v${pkg.version}</span></p>
  <p>MIT licence for the code here. Every entry credits its source; recreations copy no code or assets. Found your work here without a credit? <a href="${REPO_URL}/issues/new?template=credit-or-removal.yml" rel="noopener">Tell us</a>.</p>
  <p><a href="${REPO_URL}" rel="noopener">GitHub</a> <a href="${REPO_URL}/issues/new?template=suggest-a-motion.yml" rel="noopener">Suggest a motion</a> <a href="/motion.css" download>motion.css</a> <a href="/tokens.css">tokens.css</a> <a href="/play.js">play.js</a></p>
</footer>`;
}

// Entry pages
const order = [...templates, ...patterns];
for (const [i, e] of order.entries()) {
  const m = e.meta;
  const prev = order[(i - 1 + order.length) % order.length];
  const next = order[(i + 1) % order.length];
  const readme = existsSync(join(e.path, "README.md")) ? markdown(readFileSync(join(e.path, "README.md"), "utf8")) : "";
  const css = readFileSync(join(e.path, "style.css"), "utf8");
  const js = jsFiles(e);
  const facts = [
    ["Kind", e.kind === "template" ? "Template" : `Pattern, ${CATEGORY[m.category].toLowerCase()}`],
    ["Starts", TRIGGER[m.trigger]],
    ["Reduced motion", REDUCED[m.reduced_motion]],
    ["Built with", m.tech.map((t) => TECH[t]).join(", ")],
    ...(m.uses ? [["Uses", m.uses.map((u) => `<a href="/patterns/${u}/">${esc(byName[u]?.meta.name || u)}</a>`).join(", ")]] : []),
    ["Tokens", m.tokens.map((t) => `<code>${esc(t)}</code>`).join(" ")],
    ...(m.relation === "original" ? [["Source", "Original to this collection"]] : [["Source", credit(m)]]),
  ];
  const page = `${head({ title: `${m.name}: ${e.kind} | Motion patterns`, description: m.summary, path: `/${e.rel}/` })}
<body class="entry-page">
${bar(e.kind === "template" ? "templates" : "patterns")}
<main class="studio">
  <header class="studio-head">
    <p class="crumbs"><a href="/#${e.kind === "template" ? "templates" : "patterns"}">${e.kind === "template" ? "Templates" : "Patterns"}</a></p>
    <h1 class="studio-title">${esc(m.name)}</h1>
    <p class="studio-sum">${esc(m.summary)}</p>
  </header>
  <div class="studio-stage">
    <div class="viewport-bar" role="group" aria-label="Stage width">
      <button type="button" data-width="fit" aria-pressed="true">Fit</button>
      <button type="button" data-width="768" aria-pressed="false">Tablet</button>
      <button type="button" data-width="390" aria-pressed="false">Phone</button>
      <a class="viewport-open" href="/${e.rel}/demo.html">Open the demo alone</a>
    </div>
    ${stage(e, { lazy: false, size: " stage-large" })}
    ${sheet(e.slug, { trigger: m.trigger, label: m.name })}
  </div>
  <div class="studio-body">
    <aside class="studio-side">
      <dl class="facts">
${facts.map(([k, v]) => `        <div><dt>${k}</dt><dd>${v}</dd></div>`).join("\n")}
      </dl>
      <div class="actions">
        <button type="button" class="btn btn-key" data-copy="${copyPath(e)}" data-name="${esc(m.name)}">Copy ${e.kind === "template" ? "the full CSS" : "style.css"}</button>
        <a class="btn" href="${REPO_URL}/tree/main/${e.rel}" rel="noopener">Source on GitHub</a>${existsSync(join(e.path, "preview.mp4")) ? `\n        <a class="btn btn-quiet" href="/${e.rel}/preview.mp4">Video</a>` : ""}
      </div>
    </aside>
    <article class="readme">
${readme}
    </article>
  </div>
  <section class="studio-code" aria-labelledby="code-h">
    <div class="code-head">
      <h2 id="code-h">${e.kind === "template" ? "Template CSS" : "style.css"}</h2>
      <button type="button" class="btn btn-small" data-copy="/${e.rel}/style.css" data-name="${esc(m.name)} style.css">Copy</button>
    </div>
    ${e.kind === "template" ? `<p class="code-note">This is the template's own layer. <strong>Copy the full CSS</strong> above for one file with the tokens and every pattern it uses.${js.length ? ` It also ships ${js.map((f) => `<a href="/${e.rel}/${f}"><code>${f}</code></a>`).join(" and ")}.` : ""}</p>` : ""}
    ${codeBlock(css, "css")}
  </section>
  <nav class="pager" aria-label="More entries">
    <a href="/${prev.rel}/" rel="prev"><span>Previous</span>${esc(prev.meta.name)}</a>
    <a href="/${next.rel}/" rel="next"><span>Next</span>${esc(next.meta.name)}</a>
  </nav>
</main>
${foot()}
<p class="sr-only" role="status" aria-live="polite" id="status"></p>
</body>
</html>
`;
  writeFileSync(join(DIST, e.rel, "index.html"), page);
}

const urls = ["", ...entries.map((e) => `${e.rel}/`)];
writeFileSync(join(DIST, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE_URL}/${u}</loc></url>`).join("\n")}
</urlset>
`);
writeFileSync(join(DIST, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);

const size = (p) => statSync(join(DIST, p)).size;
console.log(`built dist/: ${entries.length} entries, motion.css ${size("motion.css")} B (${gz} B gzipped)`);
