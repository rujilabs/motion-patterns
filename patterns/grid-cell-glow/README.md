# Grid cell glow

Use when: a co-working space lets people pick a hot desk from its floor plan, and the cells near the hand should light up before anyone clicks.

Cells of a grid light up by their distance to the pointer: full under it, softer around it, dark beyond. The light eases after the pointer, and its labels turn dark once a cell is bright enough to need it. Focus a cell and the light sits on it.

[Live demo](https://motion.rujilabs.com/patterns/grid-cell-glow/) · [style.css](style.css) · [grid-cell-glow.js](grid-cell-glow.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="grid-cell-glow/style.css">
<script src="grid-cell-glow/grid-cell-glow.js" defer></script>

<div class="gg" role="group" aria-label="Floor plan, level 7. Arrow keys move between desks." data-gg-reach="1.8">
  <button type="button" class="gg-cell" aria-pressed="false">A1</button>
  <button type="button" class="gg-cell" aria-disabled="true">A2<span class="vh">, booked</span></button>
  <div class="gg-cell">Pantry</div>
  <!-- your grid layout: give .gg display: grid and its columns -->
</div>
```

```js
document.querySelector(".gg").addEventListener("gg-pick", (e) => book(e.detail.cell));
```

## Options

| Name | What it does | Default |
|---|---|---|
| `data-gg-reach` | How far the light spreads, in widths of the smallest cell | `1.8` |
| `--gg-cell`, `--gg-line` | A cell and its edge in the dark | Slate |
| `--gg-lit` | The light | Lamp amber |
| `--gg-ink`, `--gg-ink-lit` | Label colour in the dark and under full light | Light grey, near black |

The script sets `--gg` (0 to 1) on every `.gg-cell`; the CSS mixes the colours from it, so restyle freely. Distance is measured to a cell's edge, so a wide cell (a meeting room) lights as soon as the light reaches it. Buttons inside get one tab stop for the whole grid, then arrow keys move to the nearest button in that direction; click or Enter fires `gg-pick`. A finger dragged across lights the cells under it; the grid keeps `touch-action: pan-y`.

The first time the grid comes into view the light sweeps across it once (1.4 s, on a Web Animations clock). Without the script, hover and focus still light a single cell.

## Do

- Use it on a dark plan: light only reads against dark.
- Keep the picked cell in a solid colour of its own, so it does not get lost in the glow.

## Do not

- Do not use the glow to say a cell is free or booked. That needs its own mark, as in the demo's hatching.
- Do not set the reach above about 3: the whole grid lights and nothing stands out.

## Reduced motion

No sweep and no easing: the light jumps to the pointer or the focused cell.
