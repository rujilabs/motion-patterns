// Reads the easing tokens from tokens.css and turns each into an SVG path for the gallery's curve plots.
// cubic-bezier() is sampled; linear() stop lists are drawn point for point (the spring overrides its fallback).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./entries.mjs";

export function easingTokens() {
  const css = readFileSync(join(ROOT, "tokens.css"), "utf8");
  const found = new Map();
  for (const m of css.matchAll(/(--ease-[\w-]+)\s*:\s*((?:cubic-bezier|linear)\([^)]*\))\s*;\s*(?:\/\*\s*([^*]*?)\s*\*\/)?/g)) {
    const prev = found.get(m[1]);
    const note = m[3] || (m[2].startsWith("linear") ? "a damped spring: one overshoot, one small settle" : prev?.note || "");
    found.set(m[1], { name: m[1], value: m[2], note });
  }
  return [...found.values()].map((t) => ({ ...t, points: sample(t.value) }));
}

function sample(value) {
  const nums = (value.match(/-?\d*\.?\d+/g) || []).map(Number);
  if (value.startsWith("linear")) return nums.map((y, i) => [i / (nums.length - 1), y]);
  const [x1, y1, x2, y2] = nums;
  const bez = (t, a, b) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  const pts = [];
  for (let i = 0; i <= 64; i++) { const t = i / 64; pts.push([bez(t, x1, x2), bez(t, y1, y2)]); }
  return pts;
}

// Plot box: x 0..1 maps to 0..W; y -0.2..1.4 maps to H..0, so overshoot and anticipation stay inside.
export const PLOT = { W: 200, H: 200, lo: -0.25, hi: 1.35 };
export const py = (y) => +(PLOT.H - ((y - PLOT.lo) / (PLOT.hi - PLOT.lo)) * PLOT.H).toFixed(2);
export const px = (x) => +(x * PLOT.W).toFixed(2);
export const pathFor = (points) => points.map(([x, y], i) => `${i ? "L" : "M"}${px(x)} ${py(y)}`).join(" ");
