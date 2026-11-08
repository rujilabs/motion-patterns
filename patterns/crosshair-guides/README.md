# Crosshair guides

Two dashed guide lines and a live coordinate tag follow the pointer over a map or plan, in the plan's own units, like the guides in a drawing tool. They glide the last few px so they read as instruments, not as a second cursor. Arrow keys move them too, and Enter or a click picks the spot.

[Live demo](https://motion.rujilabs.com/patterns/crosshair-guides/) · [style.css](style.css) · [crosshair-guides.js](crosshair-guides.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="crosshair-guides/style.css">
<script src="crosshair-guides/crosshair-guides.js" defer></script>

<div class="ch" tabindex="0" role="group" aria-roledescription="site plan" aria-label="Site plan, phase 2"
     data-ch-width="240" data-ch-height="180" data-ch-start="108.6 43.2" data-ch-unit="m">
  <svg viewBox="0 0 240 180" aria-hidden="true">...the plan, filling the box...</svg>
  <span class="ch-v" aria-hidden="true"></span>
  <span class="ch-h" aria-hidden="true"></span>
  <span class="ch-tag" aria-hidden="true"></span>
</div>
```

```js
const plan = document.querySelector(".ch");
plan.addEventListener("ch-move", (e) => showLotAt(e.detail.x, e.detail.y));   // every change
plan.addEventListener("ch-pick", (e) => pickLotAt(e.detail.x, e.detail.y));   // click, tap, Enter, Space
```

Give the box the same aspect ratio as the plan, so units map straight onto it. Put what the spot means (the lot, its size, its price) in HTML next to the plan, and announce it from a `role="status"` element when `e.detail.by` is `"key"`.

## Options

| Name | What it does | Default |
|---|---|---|
| `data-ch-width`, `data-ch-height` | The plan's size in its own units | `100` |
| `data-ch-start` | Where the guides start, x and y from the top left | The middle |
| `data-ch-unit` | Unit shown in the tag | none |
| `--ch-line` | Guide colour | Red |
| `--ch-tag-bg`, `--ch-tag-ink` | Tag colours | Ink and white |

The tag shows east (x) and north, counted up from the bottom edge as on a survey plan. Event detail is `{ x, y, n, by }`. Arrow keys move 1 unit, Shift with an arrow 10. The tag flips to the other side near an edge. On touch, a tap moves the guides and picks; the box keeps `touch-action: pan-y`, so a sideways drag moves them and an up or down drag scrolls the page.

The guides draw in from the edges once when the plan comes into view (Web Animations, so the gallery timeline shows them).

## Do

- Use it where the position itself is the answer: a lot, a seat, a stand, a spot on a floor plan.
- Keep the tag short: two numbers and a unit.

## Do not

- Do not use it on a photo with no scale. Coordinates mean nothing there.
- Do not hide the real cursor. The guides are extra.

## Reduced motion

The guides jump straight to the pointer or the key press, with no glide and no draw-in.
