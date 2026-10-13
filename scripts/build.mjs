// Builds the gallery site into dist/. Runs the check gate first; any problem stops the build.
import { rmSync, mkdirSync, cpSync, readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { check } from "./check.mjs";
import { loadEntries, ROOT } from "./entries.mjs";
import { SITE_URL, REPO_URL } from "./site.mjs";

const problems = check();
if (problems.length) {
  console.error(problems.map((p) => `x ${p}`).join("\n"));
  process.exit(1);
}

const DIST = join(ROOT, "dist");
const BUNDLE_BUDGET_GZ = 6 * 1024; // motion.css must stay small enough to drop into any page
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

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

function credit(m) {
  if (m.relation === "original") return "Original";
  const label = { port: "Port of", recreation: "Recreation of", "inspired-by": "Inspired by" }[m.relation];
  return `${label} <a href="${esc(m.source.url)}" rel="noopener">${esc(m.source.author)}</a>`;
}

function card(e) {
  const m = e.meta;
  return `<article class="entry entry-${e.kind}" data-kind="${e.kind}">
  <div class="frame"><iframe src="${e.rel}/" title="${esc(m.name)} demo" loading="lazy"></iframe></div>
  <div class="info">
    <h3><a href="${e.rel}/">${esc(m.name)}</a></h3>
    <p>${esc(m.summary)}</p>
    <p class="tags">${m.tech.map((t) => `<span>${esc(t)}</span>`).join("")}<span>${esc(m.trigger)}</span></p>
    <p class="credit">${credit(m)}</p>
    <div class="actions">
      <button type="button" data-replay>Replay</button>
      <button type="button" data-copy="${e.rel}/style.css">Copy CSS</button>
      <a href="${REPO_URL}/tree/main/${e.rel}" rel="noopener">Code</a>${existsSync(join(e.path, "preview.mp4")) ? `\n      <a href="${e.rel}/preview.mp4">Video</a>` : ""}
    </div>
  </div>
</article>`;
}

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Motion patterns: a credited collection of web motion</title>
<meta name="description" content="A free, open collection of web motion: small CSS patterns and full scenes, each with a live demo, reduced-motion support and a credit to where it came from.">
<link rel="canonical" href="${SITE_URL}/">
<meta property="og:title" content="Motion patterns">
<meta property="og:description" content="A credited collection of web motion. CSS first, no dependencies, MIT.">
<meta property="og:url" content="${SITE_URL}/">
<meta property="og:type" content="website">
${existsSync(join(DIST, "og.png")) ? `<meta property="og:image" content="${SITE_URL}/og.png">\n<meta name="twitter:card" content="summary_large_image">` : ""}
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="site.css">
<script src="gallery.js" defer></script>
</head>
<body>
<header class="masthead">
  <p class="kicker">v${pkg.version} · ${patterns.length} patterns · ${templates.length} templates</p>
  <h1>Motion patterns</h1>
  <p class="intro">A collection of web motion. Small CSS patterns and full scenes, each with a live demo, a reduced-motion state and a credit to where it came from. CSS first, no dependencies, MIT.</p>
  <div class="cta">
    <a class="btn btn-solid" href="motion.css" download>Get motion.css</a>
    <a class="btn" href="${REPO_URL}" rel="noopener">GitHub</a>
    <a class="btn" href="${REPO_URL}/issues/new?template=suggest-a-motion.yml" rel="noopener">Suggest a motion</a>
  </div>
</header>

<section class="howto" aria-labelledby="howto-h">
  <h2 id="howto-h">Use one in a minute</h2>
  <pre><code>&lt;link rel="stylesheet" href="motion.css"&gt;
&lt;script src="play.js"&gt;&lt;/script&gt;   &lt;!-- only for in-view patterns --&gt;

&lt;h1 class="rise"&gt;Hello&lt;/h1&gt;</code></pre>
  <p>Or copy one entry: <code>tokens.css</code> plus that entry's <code>style.css</code>. Everything respects <code>prefers-reduced-motion</code> by showing the finished state.</p>
</section>

<nav class="filters" aria-label="Filter entries">
  <button type="button" data-filter="all" aria-pressed="true">All</button>
  <button type="button" data-filter="pattern" aria-pressed="false">Patterns</button>
  <button type="button" data-filter="template" aria-pressed="false">Templates</button>
</nav>

<main class="grid">
${[...templates, ...patterns].map(card).join("\n")}
</main>

<footer class="foot">
  <p>MIT licence for the code here. Every entry credits its source; recreations copy no code or assets.
  Found your work here without a credit? <a href="${REPO_URL}/issues/new?template=credit-or-removal.yml" rel="noopener">Tell us</a>.</p>
</footer>
</body>
</html>
`;
writeFileSync(join(DIST, "index.html"), html);

const urls = ["", ...entries.map((e) => `${e.rel}/`)];
writeFileSync(join(DIST, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE_URL}/${u}</loc></url>`).join("\n")}
</urlset>
`);
writeFileSync(join(DIST, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);

const size = (p) => statSync(join(DIST, p)).size;
console.log(`built dist/: ${entries.length} entries, motion.css ${size("motion.css")} B (${gz} B gzipped)`);
