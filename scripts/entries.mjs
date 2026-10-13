// Reads every entry (patterns/* and templates/*) and its meta.json.
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

export const ROOT = new URL("..", import.meta.url).pathname;
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
