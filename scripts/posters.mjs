// Captures each entry's finished frame to poster.jpg in its folder.
// Templates: 1280 x 720. The gallery shows the poster while a template is off screen or scrolling past, and
// swaps in the live demo once it is in view.
// Patterns: 480 x 360 (an 800 x 600 page at 0.6 scale). The gallery grid shows the poster and loads the live
// demo only on hover or keyboard focus; the entry page's related cards use it too.
//   npm i --no-save playwright && npx playwright install chromium   (once)
//   npm run posters                      every entry
//   npm run posters -- --missing         only entries without a poster.jpg
//   npm run posters -- rise stamp-collage   these entries
// Playwright is not a dependency on purpose: the collection itself needs nothing.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { loadEntries } from "./entries.mjs";

const args = process.argv.slice(2);
const missing = args.includes("--missing");
const only = args.filter((a) => !a.startsWith("--"));
const entries = loadEntries().filter((e) =>
  (!only.length || only.includes(e.slug)) && (!missing || !existsSync(join(e.path, "poster.jpg"))));
if (!entries.length) {
  console.log(missing ? "every entry already has a poster" : "usage: npm run posters [-- --missing | <slug> ...]");
  process.exit(missing ? 0 : 1);
}
let chromium;
try { ({ chromium } = await import("playwright")); } catch {
  console.error("Playwright is not installed. Run: npm i --no-save playwright && npx playwright install chromium");
  process.exit(1);
}

const SIZE = {
  template: { viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1, quality: 82 },
  pattern: { viewport: { width: 800, height: 600 }, deviceScaleFactor: 0.6, quality: 72 },
};

// SwiftShader gives headless Chromium a software WebGL, so shader entries render a real frame.
const GL_ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"];
const browser = await chromium.launch({ args: GL_ARGS, ...(process.env.CHROME ? { executablePath: process.env.CHROME } : {}) });
let failed = 0;
for (const e of entries) {
  const s = SIZE[e.kind];
  // A scroll-driven entry sits mid-way at the top of its page; its reduced-motion state is the finished one.
  const reducedMotion = e.meta?.trigger === "scroll" ? "reduce" : "no-preference";
  const page = await browser.newPage({ viewport: s.viewport, deviceScaleFactor: s.deviceScaleFactor, reducedMotion });
  try {
    await page.goto(pathToFileURL(join(e.path, "index.html")).href, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    // Let the entrance run, then jump every animation that has an end to its end.
    await page.waitForTimeout(e.kind === "template" ? 1500 : 1200);
    await page.evaluate(() => document.getAnimations().forEach((a) => { try { if (a.effect.getComputedTiming().endTime !== Infinity) a.finish(); } catch (err) { /* loops */ } }));
    await page.waitForTimeout(e.kind === "template" ? 3500 : 1500);
    await page.screenshot({ path: join(e.path, "poster.jpg"), type: "jpeg", quality: s.quality });
    console.log(`wrote ${e.rel}/poster.jpg`);
  } catch (err) {
    failed++;
    console.error(`x ${e.rel}: ${err.message}`);
  }
  await page.close();
}
await browser.close();
if (failed) process.exit(1);
