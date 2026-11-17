// The CLI against a small fake site served on localhost. No network, no dependencies.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const BIN = fileURLToPath(new URL("../bin.mjs", import.meta.url));
const run = promisify(execFile);

const entry = (slug, extra = {}) => ({
  slug, kind: "pattern", name: slug, summary: `The ${slug} move.`, category: "entry", tech: ["css"], trigger: "load",
  added: "2026-11-17", path: `patterns/${slug}`, files: ["style.css"], fonts: [], uses: [], play: false, ...extra,
});

const CATALOGUE = {
  format: 1, name: "motion-patterns", version: "9.9.9", site: "http://fake",
  shared: { tokens: "tokens.css", play: "play.js", fonts: "fonts" },
  entries: [
    entry("rise"),
    entry("fade"),
    entry("badge", { category: "emphasis", tech: ["css", "js"], trigger: "click", files: ["badge.js", "style.css"], summary: "A count badge that springs in." }),
    entry("reveal", { category: "scroll", trigger: "in-view", play: true }),
    entry("squeeze", { category: "type", fonts: ["anybody-vf.woff2"] }),
    entry("board", { kind: "template", path: "templates/board", category: "type", files: ["board.js", "style.css"], uses: ["fade", "rise"], play: true }),
  ],
};

const FILES = {
  "tokens.css": ":root { --ease-out: linear(0, 1); }\n",
  "play.js": "/* play */\n",
  "fonts/anybody-vf.woff2": "FONTBYTES",
  "fonts/OFL.txt": "OFL\n",
  "patterns/squeeze/style.css": '@font-face { src: url("../../fonts/anybody-vf.woff2"); }\n',
  "patterns/badge/badge.js": "/* badge */\n",
  "templates/board/board.js": "/* board */\n",
  "templates/board/README.md": '# Board\n\n## Use\n\n```html\n<script src="board.js" defer></script>\n```\n\n## Next\n',
};
for (const e of CATALOGUE.entries) {
  FILES[`${e.path}/style.css`] ??= `.${e.slug} {}\n`;
  FILES[`${e.path}/README.md`] ??= `# ${e.slug}\n\n## Use\n\nUse it.\n\n## Do\n`;
}

let server, site, catalogue = CATALOGUE, broken = null;
before(async () => {
  server = createServer((req, res) => {
    const path = decodeURIComponent(req.url.slice(1));
    if (path === broken) { res.writeHead(500); return res.end(); }
    if (path === "catalogue.json") { res.writeHead(200, { "content-type": "application/json" }); return res.end(JSON.stringify(catalogue)); }
    if (path in FILES) { res.writeHead(200); return res.end(FILES[path]); }
    res.writeHead(404); res.end();
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  site = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

const made = [];
const project = () => { const d = mkdtempSync(join(tmpdir(), "mp-cli-")); made.push(d); return d; };
async function cli(args, cwd = project()) {
  try {
    const { stdout, stderr } = await run(process.execPath, [BIN, ...args, "--site", site], { cwd, env: { ...process.env, NO_COLOR: "1" } });
    return { code: 0, stdout, stderr, cwd };
  } catch (e) {
    return { code: e.code, stdout: e.stdout, stderr: e.stderr, cwd };
  }
}
const read = (cwd, p) => readFileSync(join(cwd, p), "utf8");

test("--version and --help need no network", async () => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal((await cli(["--version"])).stdout.trim(), pkg.version);
  const help = await cli(["--help"]);
  assert.match(help.stdout, /motion-patterns add <slug\.\.\.>/);
});

test("list filters by category and kind", async () => {
  const r = await cli(["list", "--category", "type"]);
  assert.equal(r.code, 0);
  assert.match(r.stdout, /squeeze/);
  assert.match(r.stdout, /board/);
  assert.doesNotMatch(r.stdout, /badge/);
  const t = await cli(["list", "--kind", "template", "--json"]);
  assert.deepEqual(JSON.parse(t.stdout).map((e) => e.slug), ["board"]);
});

test("list rejects an unknown category", async () => {
  const r = await cli(["list", "--category", "nope"]);
  assert.equal(r.code, 1);
  assert.match(r.stderr, /No category "nope"/);
});

test("search matches every word and ranks the slug first", async () => {
  const r = await cli(["search", "count", "badge", "--json"]);
  assert.deepEqual(JSON.parse(r.stdout).map((e) => e.slug), ["badge"]);
  assert.match((await cli(["search", "zzz"])).stdout, /Nothing matches/);
});

test("add copies tokens, the entry's files and a head snippet", async () => {
  const r = await cli(["add", "badge"]);
  assert.equal(r.code, 0, r.stderr);
  assert.equal(read(r.cwd, "motion/tokens.css"), FILES["tokens.css"]);
  assert.equal(read(r.cwd, "motion/badge/style.css"), FILES["patterns/badge/style.css"]);
  assert.equal(read(r.cwd, "motion/badge/badge.js"), FILES["patterns/badge/badge.js"]);
  assert.ok(!existsSync(join(r.cwd, "motion/play.js")), "play.js only when an entry needs it");
  assert.ok(!existsSync(join(r.cwd, "motion/badge/README.md")), "demo and docs files stay out");
  assert.match(r.stdout, /<link rel="stylesheet" href="motion\/badge\/style.css">/);
  assert.match(r.stdout, /<script src="motion\/badge\/badge.js"><\/script>/);
});

test("add brings play.js for in-view entries", async () => {
  const r = await cli(["add", "reveal"]);
  assert.equal(read(r.cwd, "motion/play.js"), FILES["play.js"]);
  assert.match(r.stdout, /<script src="motion\/play.js"><\/script>/);
});

test("add copies fonts and rewrites their path", async () => {
  const r = await cli(["add", "squeeze", "--dir", "assets/mp"]);
  assert.equal(r.code, 0, r.stderr);
  assert.equal(read(r.cwd, "assets/mp/fonts/anybody-vf.woff2"), "FONTBYTES");
  assert.ok(existsSync(join(r.cwd, "assets/mp/fonts/OFL.txt")));
  assert.match(read(r.cwd, "assets/mp/squeeze/style.css"), /url\("\.\.\/fonts\/anybody-vf\.woff2"\)/);
});

test("a template brings the patterns it uses, first, and keeps defer", async () => {
  const r = await cli(["add", "board"]);
  assert.equal(r.code, 0, r.stderr);
  for (const p of ["fade/style.css", "rise/style.css", "board/style.css", "board/board.js", "play.js"]) assert.ok(existsSync(join(r.cwd, "motion", p)), p);
  assert.match(r.stdout, /with fade, rise/);
  const links = [...r.stdout.matchAll(/href="motion\/([a-z]+)\/style.css"/g)].map((m) => m[1]);
  assert.deepEqual(links, ["fade", "rise", "board"]);
  assert.match(r.stdout, /<script src="motion\/board\/board.js" defer><\/script>/);
});

test("existing files are kept unless --force", async () => {
  const cwd = project();
  mkdirSync(join(cwd, "motion"), { recursive: true });
  writeFileSync(join(cwd, "motion/tokens.css"), "/* mine */");
  const r = await cli(["add", "rise"], cwd);
  assert.equal(read(cwd, "motion/tokens.css"), "/* mine */");
  assert.match(r.stdout, /kept/);
  await cli(["add", "rise", "--force"], cwd);
  assert.equal(read(cwd, "motion/tokens.css"), FILES["tokens.css"]);
});

test("--dry-run writes nothing", async () => {
  const r = await cli(["add", "badge", "--dry-run"]);
  assert.equal(r.code, 0);
  assert.match(r.stdout, /would write/);
  assert.ok(!existsSync(join(r.cwd, "motion")));
});

test("an unknown slug fails before writing and suggests a near name", async () => {
  const r = await cli(["add", "rise", "badg"]);
  assert.equal(r.code, 1);
  assert.match(r.stderr, /No entry called "badg"\. Did you mean: badge/);
  assert.ok(!existsSync(join(r.cwd, "motion")));
});

test("a failed download leaves the project untouched", async () => {
  broken = "patterns/badge/badge.js";
  try {
    const r = await cli(["add", "badge"]);
    assert.equal(r.code, 1);
    assert.match(r.stderr, /answered 500/);
    assert.ok(!existsSync(join(r.cwd, "motion")));
  } finally {
    broken = null;
  }
});

test("a newer catalogue format asks for a newer CLI", async () => {
  catalogue = { ...CATALOGUE, format: 2 };
  try {
    const r = await cli(["list"]);
    assert.equal(r.code, 1);
    assert.match(r.stderr, /motion-patterns@latest/);
  } finally {
    catalogue = CATALOGUE;
  }
});

test("a catalogue that names a file outside --dir is refused", async () => {
  for (const evil of [{ files: ["../../evil.js"] }, { slug: "../up" }, { fonts: ["../x.woff2"] }, { path: "../../etc" }]) {
    catalogue = { ...CATALOGUE, entries: [entry("rise", evil)] };
    try {
      const r = await cli(["add", "rise"]);
      assert.equal(r.code, 1, JSON.stringify(evil));
      assert.match(r.stderr, /unsafe entry/);
      assert.ok(!existsSync(join(r.cwd, "motion")) && !existsSync(join(r.cwd, "..", "evil.js")));
    } finally {
      catalogue = CATALOGUE;
    }
  }
});

test("info prints the README and where to see it", async () => {
  const r = await cli(["info", "badge"]);
  assert.match(r.stdout, /# badge/);
  assert.match(r.stdout, new RegExp(`${site}/patterns/badge/`.replace(/[./]/g, "\\$&")));
  assert.match(r.stdout, /npx motion-patterns add badge/);
});

test("an unknown command shows help", async () => {
  const r = await cli(["fly"]);
  assert.equal(r.code, 1);
  assert.match(r.stderr, /Unknown command "fly"/);
});

test("a site that is down gives a plain message", async () => {
  const r = await run(process.execPath, [BIN, "list", "--site", "http://127.0.0.1:9"]).catch((e) => e);
  assert.equal(r.code, 1);
  assert.match(r.stderr, /Could not reach http:\/\/127\.0\.0\.1:9\/catalogue\.json/);
});

after(() => { for (const d of made) rmSync(d, { recursive: true, force: true }); });
