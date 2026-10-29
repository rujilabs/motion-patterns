# Object categories implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 11 new categories plus 5 entries to `data`, giving 60 original entries. Each one shows a real use case, and the set ships as v0.4.0 on motion.rujilabs.com.

**Architecture:** Every entry is a self-contained folder in `patterns/<slug>/`, in the existing shape. The gate (`scripts/check.mjs`) and the gallery build (`scripts/build.mjs`) learn the new categories once, in Task 1. Tasks 2 to 13 each build one category of 5 entries and finish with a green build plus a screenshot review. Task 14 releases.

**Tech Stack:** HTML, CSS (3D transforms, `@property`, scroll timelines where supported), vanilla JS, SVG, Canvas 2D. Node 20 scripts. Playwright, used only for review screenshots.

**Spec:** `docs/superpowers/specs/2026-10-29-object-categories-design.md`

## Global Constraints

- Zero runtime dependencies. No three.js, WebGL or libraries.
- Every entry: `meta.json` (all fields, `relation: "original"`, `added: "2026-10-29"`), `README.md` (first line after the title: `Use when: <job>.`, then the `rise` shape), `index.html`, `style.css` (the pattern only), optional `page.css`, `demo.js` and `<slug>.js`.
- `prefers-reduced-motion: reduce` shows the final state. A hidden start state is scoped under `.js`. The no-JS page still reads.
- Hands-on entries work with a pointer, touch (`touch-action` set, pointer events) and keyboard, and carry correct ARIA roles.
- Copy uses plain words, no em or en dashes, fictional businesses, and real-looking specific numbers (no 1,000 or 99%). The settings are generic, not Daus's products.
- Anti-goals: no purple-to-blue gradients, glowing orbs, glass cards or filler text, and no loop without a reason. Physics must be right (gear speed follows tooth ratio, drums snap, panels swing on a hinge).
- Each demo may use its own colours in `page.css`, with a `prefers-color-scheme: dark` pair. Nothing is added to `demo.css`.
- Time-based demos use a simulated clock with a visible hour control and a set starting time.
- The demo fits the 4:3 gallery stage and works at 375 px wide. An entrance finishes within about 3 s. Anything that moves for more than 5 s can be paused.
- `motion-<category>.css` is 10 KB gzipped or less.

## Review Focus

1. Touch drag on a phone (knob, drum, globe, rolodex, lever, connector) must not scroll the page while dragging, and must still let the page scroll when the touch is not on the control.
2. Keyboard only: every hands-on control can be reached with Tab and works with arrows, Enter or Space, and the focus ring shows.
3. Reduced motion on: every demo lands in a readable final state, not a blank or half state.
4. The short 4:3 gallery iframe at 1280 and 375: nothing clipped and no scrollbars.
5. Dark scheme: the text keeps contrast and the 3D faces stay readable.

Each category task checks all five in its review step.

---

### Task 1: Teach the gate and the gallery the new categories

**Files:**
- Modify: `scripts/check.mjs:8` (`CATEGORIES`)
- Modify: `scripts/build.mjs:80` (`CATEGORY` labels, order = filter order)
- Create: `scripts/globe-dots.mjs` (authoring-time generator, not shipped to the site)

**Interfaces:**
- Produces: category keys `curve, morph, tile, solid, gear, panel, light, wave, globe, drum, form` (plus the existing `data`). Labels: `curve: "Curved paths", morph: "Morphs", tile: "Tiles", solid: "Solids", gear: "Gears", panel: "Panels", light: "Light", wave: "Waves", globe: "Globes", drum: "Drums", form: "Form controls"`, appended after `scene`.
- Produces: `node scripts/globe-dots.mjs --step 3 > out.json`, which prints `[[lon, lat], ...]` land points on a 3-degree grid from Natural Earth 110m land (public domain, downloaded to `node_modules/.cache` when missing). The output is pasted inline into globe entries.

- [ ] Step 1: Run `npm run check`. Expected: PASS on 150 entries (baseline).
- [ ] Step 2: Add the keys and labels. Write `globe-dots.mjs` (point-in-polygon on a lat/lon grid).
- [ ] Step 3: Run `node scripts/globe-dots.mjs --step 3 | node -e "const a=JSON.parse(require('fs').readFileSync(0));console.log(a.length)"`. Expected: about 1,500 to 2,500 points.
- [ ] Step 4: Run `npm run build`. Expected: PASS.
- [ ] Step 5: Commit `chore: add object categories to the gate and gallery`.

### Tasks 2 to 13: one category each

There is one task per category, in this order: gear, drum, form, globe, curve, morph, tile, solid, panel, data, light, wave. The slugs, use cases and modes are in the spec table for that category, and the task builds those 5 rows exactly.

**Files per task:** `patterns/<slug>/{meta.json,README.md,index.html,style.css,page.css,demo.js?,<slug>.js?}` × 5.

**Interfaces:** Consumes the category key from Task 1. Globe entries consume `scripts/globe-dots.mjs` output.

- [ ] Step 1: Build the 5 entries. Start each one from the closest existing entry (`odometer` for JS plus data attributes, `rise` for the README shape).
- [ ] Step 2: Run `npm run catalogue && npm run check`. Expected: PASS.
- [ ] Step 3: Run `npm run build`. Expected: PASS, and `motion-<cat>.css` is 10 KB gzipped or less.
- [ ] Step 4: Run the review shots for the batch: `node <scratchpad>/shots.mjs <slug...>`. Each demo is captured at 1280×960, at 375×812, with reduced motion, and in dark mode, after a pointer and a keyboard interaction. Check every image against the anti-goals and the Review Focus list. Fix, then run again until clean.
- [ ] Step 5: Commit `feat(<cat>): add <5 slugs>`.

### Task 14: Release v0.4.0

**Files:** `README.md` (catalogue and category files), `CHANGELOG.md`, `package.json` version, `dist/` (built).

- [ ] Step 1: Run `npm run catalogue && npm run build`. Expected: PASS, 210 entries.
- [ ] Step 2: Bump to `0.4.0`, run `npm run changelog`, then commit `chore(release): v0.4.0`.
- [ ] Step 3: Push `feat/object-categories`, open a PR, wait for the Pages preview build to pass, and check the preview gallery filters for the 11 new categories.
- [ ] Step 4: Merge with admin bypass, then confirm that https://motion.rujilabs.com lists 210 entries and that `/patterns/gear-processing/` serves a 200.
