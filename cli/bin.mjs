#!/usr/bin/env node
// motion-patterns CLI: browse the collection and copy entries into a project (ADR 0007).
// Zero dependencies. Reads catalogue.json from the live site, so it always matches motion.rujilabs.com.
import { parseArgs } from "node:util";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, isAbsolute, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_SITE = "https://motion.rujilabs.com";
const FORMAT = 1;
const PKG = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "package.json"), "utf8"));

const HELP = `motion-patterns ${PKG.version}: web motion you copy into your project

Usage
  motion-patterns list [--category <c>] [--kind pattern|template] [--tech <t>]
  motion-patterns search <words...>
  motion-patterns categories
  motion-patterns info <slug>
  motion-patterns add <slug...> [--dir motion] [--force] [--dry-run]

Options
  --dir <path>     Where add copies files (default: motion)
  --force          Overwrite files that already exist (default: keep yours)
  --dry-run        Show what add would write, write nothing
  --json           list and search print JSON
  --site <url>     Read from another copy of the site (or MOTION_PATTERNS_SITE)
  -h, --help       This help
  -v, --version    CLI version

Examples
  npx motion-patterns search drum
  npx motion-patterns add rise badge
  npx motion-patterns info badge

Gallery: ${DEFAULT_SITE}`;

class CliError extends Error {}

function args(argv) {
  try {
    return parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        dir: { type: "string", default: "motion" },
        force: { type: "boolean", default: false },
        "dry-run": { type: "boolean", default: false },
        json: { type: "boolean", default: false },
        category: { type: "string" },
        kind: { type: "string" },
        tech: { type: "string" },
        site: { type: "string" },
        help: { type: "boolean", short: "h", default: false },
        version: { type: "boolean", short: "v", default: false },
      },
    });
  } catch (e) {
    throw new CliError(`${e.message}\nRun motion-patterns --help for usage.`);
  }
}

// ---------- network ----------

async function get(url, as = "text") {
  let res;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(20000), headers: { "user-agent": `motion-patterns-cli/${PKG.version}` } });
  } catch (e) {
    throw new CliError(`Could not reach ${url} (${e.cause?.code || e.name}). Check your connection, or pass --site.`);
  }
  if (!res.ok) throw new CliError(`${url} answered ${res.status}.`);
  return as === "json" ? res.json() : as === "bytes" ? Buffer.from(await res.arrayBuffer()) : res.text();
}

async function loadCatalogue(site) {
  const cat = await get(`${site}/catalogue.json`, "json");
  if (cat.format !== FORMAT) {
    throw new CliError(`The site's catalogue is format ${cat.format}; this CLI reads format ${FORMAT}. Update it: npx motion-patterns@latest`);
  }
  // Every name that becomes a file or folder must be one plain segment: no slashes, no "..".
  const NAME = /^[a-z0-9][a-z0-9._-]*$/i;
  const PATH = /^(patterns|templates)\/[a-z0-9][a-z0-9-]*$/;
  const ok = (n) => typeof n === "string" && NAME.test(n) && !n.includes("..");
  const bad = (cat.entries || []).find((e) => !ok(e.slug) || !PATH.test(e.path) || ![...(e.files || []), ...(e.fonts || []), ...(e.uses || [])].every(ok));
  if (!Array.isArray(cat.entries) || bad) throw new CliError(`The catalogue at ${site} has an unsafe entry${bad ? ` (${String(bad.slug)})` : ""}; nothing was written.`);
  return cat;
}

// Runs fn over items, at most `limit` at a time, keeping order.
async function pool(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  const worker = async () => { while (next < items.length) { const i = next++; out[i] = await fn(items[i]); } };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

// ---------- lookup ----------

function distance(a, b) {
  const d = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = d[0];
    d[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const t = d[j];
      d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = t;
    }
  }
  return d[b.length];
}

function find(cat, slug) {
  const e = cat.entries.find((x) => x.slug === slug);
  if (e) return e;
  const near = cat.entries
    .map((x) => ({ slug: x.slug, score: x.slug.includes(slug) ? 0 : distance(slug, x.slug) }))
    .filter((x) => x.score <= Math.max(2, slug.length / 3))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((x) => x.slug);
  throw new CliError(`No entry called "${slug}".${near.length ? ` Did you mean: ${near.join(", ")}?` : ""} Try: motion-patterns search ${slug}`);
}

function search(cat, words) {
  const terms = words.join(" ").toLowerCase().split(/\s+/).filter(Boolean);
  return cat.entries
    .map((e) => {
      const hay = [e.slug, e.name, e.summary, e.category, ...e.tech].join(" ").toLowerCase();
      if (!terms.every((t) => hay.includes(t))) return null;
      const score = terms.reduce((s, t) => s + (e.slug.includes(t) ? 3 : 0) + (e.name.toLowerCase().includes(t) ? 2 : 0) + (e.category === t ? 2 : 0), 0);
      return { e, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.e.slug.localeCompare(b.e.slug))
    .map((x) => x.e);
}

// ---------- output ----------

const tty = process.stdout.isTTY;
const dim = (s) => (tty ? `\x1b[2m${s}\x1b[22m` : s);
const bold = (s) => (tty ? `\x1b[1m${s}\x1b[22m` : s);

function table(entries) {
  if (!entries.length) return "Nothing matches.";
  const w = Math.max(...entries.map((e) => e.slug.length));
  const c = Math.max(...entries.map((e) => e.category.length));
  const cols = process.stdout.columns || 100;
  const room = Math.max(20, cols - w - c - 6);
  const rows = entries.map((e) => {
    const s = e.summary.length > room ? e.summary.slice(0, room - 3).trimEnd() + "..." : e.summary;
    return `${bold(e.slug.padEnd(w))}  ${dim(e.category.padEnd(c))}  ${s}`;
  });
  return `${rows.join("\n")}\n${dim(`${entries.length} ${entries.length === 1 ? "entry" : "entries"}`)}`;
}

const toJson = (entries) => JSON.stringify(entries.map(({ slug, kind, name, category, tech, trigger, summary }) => ({ slug, kind, name, category, tech, trigger, summary })), null, 2);

// ---------- add ----------

// The entries to copy: each template brings the patterns it is built from, ahead of itself.
function withDeps(cat, slugs) {
  const order = [];
  const seen = new Set();
  const visit = (slug) => {
    if (seen.has(slug)) return;
    seen.add(slug);
    const e = find(cat, slug);
    for (const u of e.uses || []) visit(u);
    order.push(e);
  };
  for (const s of slugs) visit(s);
  return order;
}

// An entry's style.css points at ../../fonts/ (two levels up in the repo); in the copy, fonts sit beside the entry folders.
const fixFonts = (css) => css.replace(/\.\.\/\.\.\/fonts\//g, "../fonts/");

// The script tags the entry's README shows with defer, so the printed snippet loads each file the same way.
function deferred(readme) {
  const set = new Set();
  for (const m of readme.matchAll(/<script\s+src="([^"]+)"\s+defer/g)) set.add(m[1].split("/").pop());
  return set;
}

async function add(cat, site, slugs, opts) {
  if (!slugs.length) throw new CliError("Name at least one entry: motion-patterns add rise");
  const entries = withDeps(cat, slugs);
  const dir = opts.dir;

  const plan = [{ from: `${site}/${cat.shared.tokens}`, to: join(dir, "tokens.css") }];
  if (entries.some((e) => e.play)) plan.push({ from: `${site}/${cat.shared.play}`, to: join(dir, "play.js") });
  const fonts = [...new Set(entries.flatMap((e) => e.fonts || []))];
  for (const f of fonts) plan.push({ from: `${site}/${cat.shared.fonts}/${f}`, to: join(dir, "fonts", f), bytes: true });
  if (fonts.length) plan.push({ from: `${site}/${cat.shared.fonts}/OFL.txt`, to: join(dir, "fonts", "OFL.txt") });
  for (const e of entries) {
    for (const f of e.files) plan.push({ from: `${site}/${e.path}/${f}`, to: join(dir, e.slug, f), css: f.endsWith(".css") });
  }

  // The catalogue comes over the network (or from any --site): never let a name in it write outside --dir.
  const base = resolve(dir);
  for (const p of plan) {
    const target = resolve(p.to);
    if (!target.startsWith(base + sep)) throw new CliError(`Refusing to write ${target}: it is outside ${base}. The catalogue at ${site} looks wrong.`);
  }

  const todo = plan.filter((p) => opts.force || !existsSync(p.to));
  const kept = plan.filter((p) => !todo.includes(p));

  // Download everything first, so a network failure leaves the project untouched.
  const bodies = opts.dryRun ? [] : await pool(todo, 6, (p) => get(p.from, p.bytes ? "bytes" : "text"));
  const readmes = await pool(entries, 6, (e) => get(`${site}/${e.path}/README.md`).catch(() => ""));

  if (!opts.dryRun) {
    todo.forEach((p, i) => {
      mkdirSync(dirname(p.to), { recursive: true });
      writeFileSync(p.to, p.css ? fixFonts(bodies[i]) : bodies[i]);
    });
  }

  const show = (p) => (isAbsolute(p) ? p : relative(process.cwd(), p) || p);
  const lines = [];
  for (const p of todo) lines.push(`  ${opts.dryRun ? "would write" : "wrote"}  ${show(p.to)}`);
  for (const p of kept) lines.push(`  ${dim("kept")}   ${show(p.to)} ${dim("(exists; --force to overwrite)")}`);

  const href = (p) => p.split("\\").join("/");
  const snippet = [`<link rel="stylesheet" href="${href(join(dir, "tokens.css"))}">`];
  for (const e of entries) snippet.push(`<link rel="stylesheet" href="${href(join(dir, e.slug, "style.css"))}">`);
  if (entries.some((e) => e.play)) snippet.push(`<script src="${href(join(dir, "play.js"))}"></script>`);
  entries.forEach((e, i) => {
    const later = deferred(readmes[i]);
    for (const f of e.files.filter((x) => x.endsWith(".js"))) snippet.push(`<script src="${href(join(dir, e.slug, f))}"${later.has(f) ? " defer" : ""}></script>`);
  });

  const asked = entries.filter((e) => slugs.includes(e.slug));
  return [
    `${opts.dryRun ? "Dry run, nothing written." : `Added ${asked.map((e) => e.slug).join(", ")}`}${entries.length > asked.length ? ` (with ${entries.filter((e) => !asked.includes(e)).map((e) => e.slug).join(", ")})` : ""}`,
    lines.join("\n"),
    "",
    bold("Put this in <head>:"),
    snippet.join("\n"),
    "",
    `Markup and options: ${asked.map((e) => `motion-patterns info ${e.slug}`).join(", ")}`,
  ].join("\n");
}

// ---------- main ----------

export async function main(argv = process.argv.slice(2)) {
  const { values: o, positionals } = args(argv);
  if (o.version) return PKG.version;
  const [cmd, ...rest] = positionals;
  if (o.help || !cmd || cmd === "help") return HELP;

  const site = (o.site || process.env.MOTION_PATTERNS_SITE || DEFAULT_SITE).replace(/\/+$/, "");
  const known = ["list", "ls", "search", "categories", "info", "add"];
  if (!known.includes(cmd)) throw new CliError(`Unknown command "${cmd}".\n\n${HELP}`);
  const cat = await loadCatalogue(site);

  if (cmd === "list" || cmd === "ls") {
    let list = cat.entries;
    if (o.kind) list = list.filter((e) => e.kind === o.kind);
    if (o.category) {
      if (!cat.entries.some((e) => e.category === o.category)) throw new CliError(`No category "${o.category}". See: motion-patterns categories`);
      list = list.filter((e) => e.category === o.category);
    }
    if (o.tech) list = list.filter((e) => e.tech.includes(o.tech));
    return o.json ? toJson(list) : table(list);
  }
  if (cmd === "search") {
    if (!rest.length) throw new CliError("Search for something: motion-patterns search drum");
    const list = search(cat, rest);
    return o.json ? toJson(list) : table(list);
  }
  if (cmd === "categories") {
    const counts = new Map();
    for (const e of cat.entries) counts.set(e.category, (counts.get(e.category) || 0) + 1);
    const w = Math.max(...[...counts.keys()].map((k) => k.length));
    return [...counts].sort((a, b) => a[0].localeCompare(b[0])).map(([k, n]) => `${k.padEnd(w)}  ${n}`).join("\n");
  }
  if (cmd === "info") {
    if (!rest[0]) throw new CliError("Which entry? motion-patterns info badge");
    const e = find(cat, rest[0]);
    const readme = await get(`${site}/${e.path}/README.md`);
    return [
      readme.trimEnd(),
      "",
      dim("---"),
      `${bold("Live demo:")} ${site}/${e.path}/`,
      `${bold("Files:")}     ${e.files.join(", ")}${e.uses?.length ? `  ${dim(`(+ patterns ${e.uses.join(", ")})`)}` : ""}`,
      `${bold("Add it:")}    npx motion-patterns add ${e.slug}`,
    ].join("\n");
  }
  if (cmd === "add") return add(cat, site, rest, { dir: o.dir, force: o.force, dryRun: o["dry-run"] });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === (await import("node:fs")).realpathSync(process.argv[1])) {
  main().then(
    (out) => { if (out) console.log(out); },
    (e) => {
      console.error(e instanceof CliError ? e.message : e.stack || String(e));
      process.exit(1);
    },
  );
}
