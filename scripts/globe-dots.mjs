// Authoring tool, not shipped: prints land points for the globe entries as [[lon, lat], ...].
// Source: Natural Earth 110m land (public domain), cached in node_modules/.cache.
// Usage: node scripts/globe-dots.mjs --step 3 > points.json
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./entries.mjs";

const URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson";
const CACHE = join(ROOT, "node_modules", ".cache", "ne_110m_land.geojson");
const arg = (name, fallback) => { const i = process.argv.indexOf(`--${name}`); return i > -1 ? Number(process.argv[i + 1]) : fallback; };
const step = arg("step", 3);

if (!existsSync(CACHE)) {
  mkdirSync(join(ROOT, "node_modules", ".cache"), { recursive: true });
  const res = await fetch(URL);
  if (!res.ok) throw new Error(`download failed: ${res.status}`);
  writeFileSync(CACHE, await res.text());
}

// Every outer ring of every land polygon. Holes are skipped: at 110m they are lakes too small to show.
const rings = JSON.parse(readFileSync(CACHE, "utf8")).features.flatMap((f) =>
  f.geometry.type === "Polygon" ? [f.geometry.coordinates[0]] : f.geometry.coordinates.map((p) => p[0]));

function inside(lon, lat, ring) {
  let hit = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

// Rows are spaced by latitude; each row's longitude step widens toward the poles so dots stay evenly spread on the sphere.
const points = [];
for (let lat = -84 + step / 2; lat < 84; lat += step) {
  const lonStep = step / Math.max(Math.cos((lat * Math.PI) / 180), 0.2);
  for (let lon = -180 + lonStep / 2; lon < 180; lon += lonStep) {
    if (rings.some((r) => inside(lon, lat, r))) points.push([Math.round(lon * 10) / 10, Math.round(lat * 10) / 10]);
  }
}
process.stdout.write(JSON.stringify(points));
