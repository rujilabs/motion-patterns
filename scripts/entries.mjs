// Reads every entry (patterns/* and templates/*) and its meta.json.
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = fileURLToPath(new URL("..", import.meta.url));

// True when the given module file is the script node was started with.
export const isMain = (url) => fileURLToPath(url) === process.argv[1] || fileURLToPath(url) === join(process.cwd(), process.argv[1] || "");
export const KINDS = { pattern: "patterns", template: "templates" };

export function loadEntries() {
  const entries = [];
  for (const [kind, dir] of Object.entries(KINDS)) {
    const base = join(ROOT, dir);
    if (!existsSync(base)) continue;
    for (const slug of readdirSync(base).sort()) {
      const path = join(base, slug);
      if (!statSync(path).isDirectory()) continue;
      const metaPath = join(path, "meta.json");
      let meta = null, error = null;
      if (existsSync(metaPath)) {
        try { meta = JSON.parse(readFileSync(metaPath, "utf8")); } catch (e) { error = e.message; }
      }
      entries.push({ kind, dir, slug, path, rel: `${dir}/${slug}`, meta, error });
    }
  }
  return entries;
}
