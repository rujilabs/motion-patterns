# Twelve object categories: design

Date: 2026-10-29. Status: draft for approval.

## Intent

The collection has 150 entries sorted by what the motion does (entry, scroll, state, ...).
This adds 12 new categories sorted by the **object that moves**: curve, morph, tile, solid,
gear, panel, data, light, wave, globe, drum, form. There are 5 new entries in each, 60 in all.
`data` already exists with 4 entries, so it grows to 9.

The entries have two jobs (Daus):

1. Showpieces on motion.rujilabs.com that bring people to the site.
2. A reference shelf to copy from later on real builds.

The object families came from research: CSS 3D Lab (MIT) is the closest prior art. Only ideas
and names are taken from it, never code. Every entry is `relation: original`.

## Goals

- **One real use case per entry, and no use case used twice** (Daus: "as many use cases as
  possible"). Each demo shows the motion doing that job on a believable screen with real labels,
  real numbers and real places.
- **Not tied to Daus's own products.** Each demo uses a generic situation from a real business:
  a cinema, an airline, a clinic, a bakery or a bank.
- **Interaction follows the use case.** When people touch the thing in real life (a knob, a
  picker or a toggle), it is hands-on, with a pointer, touch and keyboard. When it reports
  something (a status, a gauge or a loader), it plays when it scrolls into view or when its value
  changes.
- Each README starts with one "Use when:" line that names the job.

## Non-goals

- Changing or moving the existing 150 entries. `shape-morph`, `donut` and `wave-text` stay in
  their current categories.
- New templates. These are all `kind: pattern`.
- three.js, WebGL or any other dependency.

## Anti-goals: what makes it look AI-made (Daus: "ensure it's non AI generated")

- Purple-to-blue gradients, glowing orbs, glassmorphism cards, neon on black used only as
  decoration.
- Lorem ipsum, "Acme", "John Doe", or round fake numbers like 1,000 and 99%.
- Motion that loops for no reason. Every movement answers a click, a drag, a scroll or a value.
- Physics that is wrong: gears turning at the same speed whatever their size, a drum that does
  not snap to an item, a panel that moves without a hinge.
- Twelve demos that look alike. Each demo gets its own setting and palette, built from the
  existing tokens.

## Constraints (from the repo)

- Same entry shape as today: `patterns/<slug>/` with `meta.json`, `README.md`, `index.html`,
  `style.css`, optional `<slug>.js`, `page.css` and `demo.js`.
  `npm run build` must pass (`scripts/check.mjs` + catalogue + gallery).
- `scripts/check.mjs` `CATEGORIES` gains the 11 new values. The gallery filter order and the
  per-category `motion-<category>.css` cover them. Each category file stays at 10 KB gzipped
  or less, and `motion.css` stays inside its 48 KB budget. If the budget breaks, raise it in
  the same commit and say so in the changelog.
- Every entry has a `prefers-reduced-motion` rule that shows the final state, plus a no-JS
  state that still reads.
- Hands-on entries work with a mouse, touch and keyboard (arrow keys, Enter or Space) and
  carry correct ARIA roles: `slider` for a knob, `switch` for a toggle, `listbox` or `spinbutton`
  for a drum.
- Plain language, no em or en dashes in the copy. CSS 3D transforms plus small vanilla JS only.
- Release as v0.4.0 with a git-cliff changelog. `main` takes a PR with 1 approval and
  admin bypass, as in v0.3.0.

## The 60 entries

The **Use** column is the real job. **Mode** is `hands-on` (pointer, touch and keyboard) or
`plays` (in view or on a value change).

### curve: motion along or of a curved path

| Slug | Use | Mode |
|---|---|---|
| curve-route | Order tracking: the delivery route draws from the shop to the door, and a van rides the curve to its current stop | plays |
| curve-connector | Workflow builder: a curved connector follows a node you drag and stays attached at both ends | hands-on |
| curve-signature | E-sign pad: a smoothed ink stroke that thins with speed, then "Clear" un-draws it | hands-on |
| curve-arc-picker | Plan or size picker: options ride an arc, and the chosen one rises to the top | hands-on |
| curve-easing-editor | Animation settings: drag the two bezier handles and a preview dot replays the curve | hands-on |

### morph: one shape becomes another

| Slug | Use | Mode |
|---|---|---|
| morph-mic-record | Voice dictation: the mic icon morphs into a stop square while recording, and back | hands-on |
| morph-search-field | Site header: the search icon morphs open into a text field, and Esc closes it | hands-on |
| morph-pay-button | Checkout: "Pay RM 86.40" morphs into a spinner, then into a tick | hands-on |
| morph-card-detail | Shop grid: a product card grows into its detail view and shrinks back | hands-on |
| morph-weather-icon | Forecast strip: the icon morphs sun to cloud to rain as you step through the hours | hands-on |

### tile: grids of tiles

| Slug | Use | Mode |
|---|---|---|
| tile-filter-flip | Portfolio filter: the tiles flip over to new results in a ripple from the chip you pressed | hands-on |
| tile-seat-map | Cinema booking: seats pop when picked, and taken seats shake when tapped | hands-on |
| tile-habit-grid | Habit tracker: a year of day tiles fills in week by week | plays |
| tile-image-assemble | Article hero: the photo assembles from tiles as it loads | plays |
| tile-keypad-pin | Bank app: PIN keypad tiles press in 3D, and the dots shake on a wrong code | hands-on |

### solid: 3D solids

| Slug | Use | Mode |
|---|---|---|
| solid-pack-viewer | Product page: drag to turn the box packaging and read every face | hands-on |
| solid-dice-roll | Giveaway: "Pick a winner" rolls a die that lands on a real face | hands-on |
| solid-crate-stack | Warehouse stock: crates drop and stack in 3D as a delivery is booked in | plays |
| solid-coin-flip | Loyalty app: points earned flip in as a coin with the amount on its face | plays |
| solid-parcel-open | Delivery confirmation: the parcel lid opens on "Delivered" | plays |

### gear: mechanical parts with real ratios

| Slug | Use | Mode |
|---|---|---|
| gear-processing | Report export: meshing gears turn at speeds set by their tooth counts while the file builds | plays |
| gear-settings-icon | App nav: the settings cog turns a set number of teeth on hover and when its panel opens | hands-on |
| gear-rack-progress | Long article: scrolling turns a pinion that drives a rack as the reading-progress bar | plays (scroll) |
| gear-world-clock | Meeting planner: a gear train drives the clock hands to each city's time | hands-on |
| gear-sale-countdown | Flash sale: an escapement ticks the countdown, one beat per second | plays |

### panel: hinged and folding panels

| Slug | Use | Mode |
|---|---|---|
| panel-faq-hinge | Help page: FAQ answers swing open on a top hinge | hands-on |
| panel-map-fold | Event directions: a printed map unfolds in three folds | hands-on |
| panel-shutter-menu | Mobile nav: the menu drops as stacked shutters | hands-on |
| panel-door-reveal | Promo: two doors swing open to show the voucher code | hands-on |
| panel-trifold-pricing | Pricing: the side plans fold out from the middle plan | plays |

### data: values you read (adds to the existing 4)

| Slug | Use | Mode |
|---|---|---|
| data-candles | Trading app: candlesticks tick in live, and the last candle grows and wicks as the price moves | plays |
| data-bars-3d | Annual report: 3D bars rise per quarter on scroll | plays (scroll) |
| data-sparkline-live | Server monitor: a CPU sparkline ticks in new points and scrolls left | plays |
| data-funnel | Sales funnel: each stage fills in turn, with the drop-off shown | plays |
| data-poll-results | Event Q&A: live poll bars grow as votes come in, and you can cast a vote | hands-on |

### light: light as the motion

| Slug | Use | Mode |
|---|---|---|
| light-pointer-spotlight | Feature grid: a soft spotlight follows the pointer across the cards | hands-on |
| light-pull-cord | Theme toggle: pull the lamp cord to switch light or dark | hands-on |
| light-open-sign | Restaurant hours: the neon "Open" flickers on during open hours and stays dark when closed | plays |
| light-card-sheen | Membership card: a sheen slides across as the card tilts | hands-on |
| light-scan-verify | ID upload: a scan line passes over the document while it is checked | plays |

### wave: waves and ripples

| Slug | Use | Mode |
|---|---|---|
| wave-voice-note | Chat: the waveform of a voice message fills as it plays, and you can scrub it | hands-on |
| wave-liquid-fill | Fundraiser goal: water fills a jar to the percentage raised, with a moving surface | plays |
| wave-pendulum-loader | Search results loading: a pendulum wave that stops when the results land | plays |
| wave-pin-ripple | Address picker: a ripple spreads from where the pin drops on the map | hands-on |
| wave-flag-picker | Language picker: the chosen flag waves, the rest hang still | hands-on |

### globe: spheres

| Slug | Use | Mode |
|---|---|---|
| globe-country-picker | Shipping form: picking a country turns the globe to it | hands-on |
| globe-flight-arcs | Airline routes: arcs lift between cities, and a plane rides each one | plays |
| globe-day-night | Time zones: the day and night line sweeps the globe, and you can drag to turn it | hands-on |
| globe-live-dots | Live visitors: dots pulse on the globe where people are right now | plays |
| globe-text-band | "We ship worldwide" hero: a text band runs around the globe | plays |

### drum: rotating cylinders and wheels

| Slug | Use | Mode |
|---|---|---|
| drum-time-picker | Booking form: an hour and minute wheel that snaps to each slot | hands-on |
| drum-slot-voucher | Promo: three reels spin and stop on a voucher code | hands-on |
| drum-word-rotator | Hero headline: "Built for [cafes / clinics / tuition centres]" turns on a prism | plays |
| drum-combo-lock | Gift reveal: turn the number dials to the right code and the lock opens | hands-on |
| drum-rolodex | Contacts: cards flip over a rolodex drum as you scroll or type a letter | hands-on |

### form: tactile form controls

| Slug | Use | Mode |
|---|---|---|
| form-keycap | Keyboard shortcut hint and CTA: a key that presses down with travel | hands-on |
| form-rocker-switch | Notification settings: a rocker switch that tips on and off | hands-on |
| form-rotary-knob | Thermostat: drag or arrow-key the knob to set the temperature | hands-on |
| form-check-cube | Task list: the checkbox turns over like a cube to the ticked face | hands-on |
| form-lever-confirm | Large bank transfer: pull the lever all the way down to send, let go early and it springs back | hands-on |

## Settled after the builder check (Rocky's calls)

- **No use case repeats across the whole collection, not just the 60.** Three rows repeated an
  existing demo (`shape-morph` podcast, `bars` hours, `donut` gauge) and four were near-copies
  (`reorder`, `cube`, `carousel`, `stepper`). All 7 were swapped. The remaining close pairs
  (`toggle-switch`, `ripple`, `light-sweep`, `text-on-path`, `motion-path`) are kept because
  their object and technique differ (3D rocker, map pin, tilting card, 3D sphere band, map
  route). Each README links its older sibling under "See also".
- **SVG and Canvas 2D are allowed** where a path or stroke needs them (the gate already allows
  `svg` and `canvas`). The gallery timeline is not required for hands-on or rAF motion.
  Motion that just plays uses CSS or `element.animate()` so the timeline shows it.
- **Globes use real land shapes as dots**: a dot-matrix of land built at authoring time from
  Natural Earth 110m (public domain, no credit needed) and stored as a small inline list of
  points. Under 8 KB per globe, with a shared generator script in `scripts/`.
- **Palettes**: each demo may set its own colours in `page.css`, with a dark pair under
  `prefers-color-scheme: dark`. `demo.css` gains no new tokens.
- **Time-based demos run on a simulated clock** with a visible hour control (open sign, world
  clock, countdown, day and night, live dots). Each starts at a set time, so screenshots,
  posters and the reduced-motion state stay the same on every run.

## How it gets built (Rocky's calls)

- Work goes category by category, in 12 batches, on branch `feat/object-categories`. GLM and
  OpenCode Go write the entries (2 + 2 at a time). Rocky reviews every demo in a browser at
  desktop and phone width, with reduced motion on. Codex reviews when its MCP loads.
- Each batch: 5 entries, `npm run build` green, screenshots checked against the anti-goals,
  then commit.
- One PR for the release. Posters (`npm run posters`) and the README catalogue are regenerated.

## Left to the builder

- The exact settings, copy, palettes and numbers in each demo, within the anti-goals.
- Which file holds the shared per-category helpers, if any.
- Category order in the gallery filter. The proposal is to put the 12 object categories after
  the existing ones.
