// The gate. Runs before every build (npm run build) and on its own (npm run check).
// Exits non-zero with one line per problem.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { loadEntries, ROOT, isMain } from "./entries.mjs";
import { catalogueIsFresh } from "./catalogue.mjs";

const CATEGORIES = ["entry", "emphasis", "loop", "scroll", "data", "state", "scene", "type"];
const TECH = ["css", "svg", "js", "canvas", "webgl", "variable-font"];
const TRIGGERS = ["load", "in-view", "hover", "click", "scroll", "loop"];
const REDUCED = ["final-state", "static"];
const RELATIONS = ["original", "port", "recreation", "inspired-by"];
// A port copies code, so the source licence must allow it. Recreations and inspired-by entries copy nothing.
const PORT_LICENCES = ["MIT", "CC0-1.0", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "ISC", "Unlicense"];
const TEXT_EXT = [".md", ".html", ".css", ".js", ".mjs", ".json", ".yml", ".yaml", ".toml", ".svg", ".txt"];
const SKIP_DIRS = new Set([".git", "node_modules", "dist", ".wrangler"]);

export function check() {
  const problems = [];
  const fail = (where, msg) => problems.push(`${where}: ${msg}`);
  const tokens = new Set([...readFileSync(join(ROOT, "tokens.css"), "utf8").matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
  const entries = loadEntries();
  const patternSlugs = new Set(entries.filter((e) => e.kind === "pattern").map((e) => e.slug));

  for (const e of entries) {
    const at = e.rel;
    for (const f of ["index.html", "style.css", "meta.json", "README.md"]) {
      if (!existsSync(join(e.path, f))) fail(at, `missing ${f}`);
    }
    if (e.error) { fail(at, `meta.json is not valid JSON (${e.error})`); continue; }
    const m = e.meta;
    if (!m) continue;

    // meta.json
    for (const k of ["name", "slug", "kind", "summary", "category", "tech", "tokens", "trigger", "reduced_motion", "relation", "added"]) {
      if (m[k] === undefined) fail(at, `meta.json is missing "${k}"`);
    }
    if (m.slug !== e.slug) fail(at, `meta slug "${m.slug}" must equal the folder name`);
    if (m.kind !== e.kind) fail(at, `meta kind "${m.kind}" must be "${e.kind}" in ${e.dir}/`);
    if (typeof m.summary === "string" && m.summary.length > 200) fail(at, "summary is over 200 characters");
    if (m.category && !CATEGORIES.includes(m.category)) fail(at, `category must be one of ${CATEGORIES.join(", ")}`);
    if (!Array.isArray(m.tech) || !m.tech.length || m.tech.some((t) => !TECH.includes(t))) fail(at, `tech must be a non-empty list from ${TECH.join(", ")}`);
    if (!Array.isArray(m.tokens) || m.tokens.some((t) => !tokens.has(t))) fail(at, "tokens must list names defined in tokens.css");
    if (m.trigger && !TRIGGERS.includes(m.trigger)) fail(at, `trigger must be one of ${TRIGGERS.join(", ")}`);
    if (m.reduced_motion && !REDUCED.includes(m.reduced_motion)) fail(at, `reduced_motion must be one of ${REDUCED.join(", ")}`);
    if (m.added && !/^\d{4}-\d{2}-\d{2}$/.test(m.added)) fail(at, "added must be YYYY-MM-DD");
    if (m.relation && !RELATIONS.includes(m.relation)) fail(at, `relation must be one of ${RELATIONS.join(", ")}`);
    if (m.relation === "original" && m.source) fail(at, "an original entry has no source; use another relation to credit one");
    if (m.relation && m.relation !== "original") {
      const s = m.source || {};
      for (const k of ["title", "author", "url", "licence"]) if (!s[k]) fail(at, `source.${k} is required for relation "${m.relation}"`);
      if (s.url && !/^https:\/\//.test(s.url)) fail(at, "source.url must be an https link");
      if (m.relation === "port" && !PORT_LICENCES.includes(s.licence)) {
        fail(at, `a port copies code, so source.licence must be one of ${PORT_LICENCES.join(", ")}; otherwise rebuild it as a recreation`);
      }
    }
    if (e.kind === "template" && !existsSync(join(e.path, "poster.jpg"))) fail(at, "missing poster.jpg; run npm run posters -- " + e.slug);
    if (e.kind === "template") {
      if (!Array.isArray(m.uses) || !m.uses.length) fail(at, "a template lists the patterns it uses in \"uses\"");
      else for (const u of m.uses) if (!patternSlugs.has(u)) fail(at, `uses unknown pattern "${u}"`);
    }

    // style.css
    const cssPath = join(e.path, "style.css");
    if (existsSync(cssPath)) {
      const css = readFileSync(cssPath, "utf8");
      const moves = e.kind === "pattern" || /@keyframes|(?:animation|transition)\s*:/.test(css);
      if (moves && !css.includes("prefers-reduced-motion")) fail(at, "style.css needs a prefers-reduced-motion rule that shows the final state");
      for (const v of css.matchAll(/var\((--(?:ease|dur|stagger|rise)[a-z0-9-]*)/g)) {
        if (!tokens.has(v[1])) fail(at, `style.css uses ${v[1]}, which tokens.css does not define`);
      }
    }
  }

  // Every text file in the repo
  for (const file of walk(ROOT)) {
    const rel = relative(ROOT, file);
    const text = readFileSync(file, "utf8");
    if (/[\u2013\u2014]/.test(text)) fail(rel, "contains an en or em dash; use a comma, colon or plain hyphen");
    if (extname(file) === ".css" && rel !== "tokens.css" && /cubic-bezier\(/.test(text)) {
      fail(rel, "raw cubic-bezier(); add a token to tokens.css and use it");
    }
    if (extname(file) === ".css" && /url\(\s*["']?\s*(https?:)?\/\/|@import/i.test(text)) {
      fail(rel, "loads an external URL or uses @import; keep entries self-contained");
    }
    if (extname(file) === ".svg" && /<[a-z][^>]*\s(?:on[a-z]+|style)\s*=|<script/i.test(text)) {
      fail(rel, "SVG with script, inline style or an event handler");
    }
    if (extname(file) === ".html") {
      if (/\sstyle\s*=/.test(text)) fail(rel, "style=\"\" attribute (blocked by the site CSP); use a class");
      if (/<style[\s>]/.test(text)) fail(rel, "inline <style> block (blocked by the site CSP); use a stylesheet");
      if (/<script(?![^>]*\ssrc=)[^>]*>/.test(text)) fail(rel, "inline <script> (blocked by the site CSP); use a file");
      if (/<[a-z][^>]*\son[a-z]+\s*=/i.test(text)) fail(rel, "inline event handler (blocked by the site CSP)");
      for (const u of text.matchAll(/\s(?:src|href)\s*=\s*["']?\s*(https?:)?\/\//gi)) fail(rel, "loads an external URL; entries must be self-contained");
    }
  }

  // The catalogue reads every meta.json, so only compare it once the metadata itself is sound.
  if (!problems.length && !catalogueIsFresh()) fail("README.md", "the catalogue is out of date; run npm run catalogue");
  return problems;
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (TEXT_EXT.includes(extname(name))) yield p;
  }
}

if (isMain(import.meta.url)) {
  const problems = check();
  if (problems.length) {
    console.error(problems.map((p) => `x ${p}`).join("\n"));
    console.error(`\n${problems.length} problem(s).`);
    process.exit(1);
  }
  console.log("check passed");
}
