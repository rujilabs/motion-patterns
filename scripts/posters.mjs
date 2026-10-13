// Captures each template's finished frame to poster.jpg in its folder. The gallery shows the poster while
// a template is off screen or scrolling past, and swaps in the live demo once it is in view.
//   npm i --no-save playwright && npx playwright install chromium   (once)
//   npm run posters                      every template
//   npm run posters -- stamp-collage     one template
// Playwright is not a dependency on purpose: the collection itself needs nothing.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { loadEntries } from "./entries.mjs";

const only = process.argv.slice(2);
const templates = loadEntries().filter((e) => e.kind === "template" && (!only.length || only.includes(e.slug)));
if (!templates.length) {
  console.error("usage: npm run posters [-- <template-slug> ...]");
  process.exit(1);
}
let chromium;
try { ({ chromium } = await import("playwright")); } catch {
  console.error("Playwright is not installed. Run: npm i --no-save playwright && npx playwright install chromium");
  process.exit(1);
}

const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
for (const t of templates) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto(pathToFileURL(join(t.path, "index.html")).href, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  // Let the entrance finish, then jump every animation that has an end to its end.
  await page.waitForTimeout(1500);
  await page.evaluate(() => document.getAnimations().forEach((a) => { try { if (a.effect.getComputedTiming().endTime !== Infinity) a.finish(); } catch (e) { /* loops */ } }));
  await page.waitForTimeout(3500);
  await page.screenshot({ path: join(t.path, "poster.jpg"), type: "jpeg", quality: 82 });
  console.log(`wrote ${t.rel}/poster.jpg`);
  await page.close();
}
await browser.close();
if (templates.some((t) => !existsSync(join(t.path, "poster.jpg")))) process.exit(1);
