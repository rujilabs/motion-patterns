// Records an entry's demo to preview.mp4 in its folder.
//   npm i --no-save playwright && npx playwright install chromium   (once)
//   npm run preview -- templates/paper-diorama-hero [seconds]
// Needs ffmpeg on PATH. Playwright is not a dependency on purpose: the collection itself needs nothing.
import { mkdtempSync, readdirSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { ROOT } from "./entries.mjs";

const [rel, secs = "8"] = process.argv.slice(2);
if (!rel || !existsSync(join(ROOT, rel, "index.html"))) {
  console.error("usage: npm run preview -- <patterns|templates>/<slug> [seconds]");
  process.exit(1);
}
let chromium;
try { ({ chromium } = await import("playwright")); } catch {
  console.error("Playwright is not installed. Run: npm i --no-save playwright && npx playwright install chromium");
  process.exit(1);
}

const tmp = mkdtempSync(join(tmpdir(), "motion-preview-"));
const size = { width: 1280, height: 720 };
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: size, recordVideo: { dir: tmp, size } });
const page = await context.newPage();
await page.goto(`file://${join(ROOT, rel, "index.html")}`);
await page.waitForTimeout(Number(secs) * 1000);
await context.close();
await browser.close();

const webm = join(tmp, readdirSync(tmp).find((f) => f.endsWith(".webm")));
const out = join(ROOT, rel, "preview.mp4");
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", webm, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "28",
  "-preset", "slow", "-movflags", "+faststart", "-an", out]);
rmSync(tmp, { recursive: true, force: true });
console.log(`wrote ${rel}/preview.mp4`);
