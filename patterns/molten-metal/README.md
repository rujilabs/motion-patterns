# Molten metal

Use when: a goldsmith, jeweller or gold trader wants a hero that says "melted and made by hand", with blobs of molten gold rising and sinking like a lava lamp behind today's gold price.

A WebGL fragment shader draws seven blobs of molten gold in a dark workshop. They rise and sink slowly, stretch as they move, and merge and split where they meet like wax in a lava lamp. The gold mirrors a softbox above and a warm light from the side, and still glows hot orange at its thin rim, with heat haze round it. It loops with no seam every 84 seconds.

[Live demo](https://motion.rujilabs.com/patterns/molten-metal/) · [style.css](style.css) · [molten-metal.js](molten-metal.js)

## Use

```html
<link rel="stylesheet" href="molten-metal/style.css">
<script src="molten-metal/molten-metal.js" defer></script>

<section class="molten">
  <canvas class="mo-canvas" aria-hidden="true"></canvas>
  <div class="card">
    <h1>Your old gold, melted down and made again by hand.</h1>
    <dl>...today's rates...</dl>
  </div>
  <button type="button" class="mo-pause" aria-pressed="false" hidden>Pause</button>
</section>
```

The canvas fills the `.molten` behind its content. Put the prices on a dark card beside the blobs. The script shows the Pause button only when the gold can move.

## Options

| Name | What it does | Default |
|---|---|---|
| `--mo-base` | The dark workshop (6 digit hex) | `#120b08` |
| `--mo-gold` | The gold | `#ffc254` |
| `--mo-heat` | The glow of hot metal | `#e8501a` |
| `--mo-x` | Where the blobs rise, 0 to 1 from the left | `.7` |
| `--mo-y` | Their middle height, in heights up from the centre | `0` |
| `--mo-spread` | How far they wander sideways, in heights | `.26` |
| `--mo-rise` | How far they rise and sink, in heights | `.36` |
| `--mo-size` | Blob size | `1` |

The custom properties are read again on every resize, so a media query can move the lamp (the demo puts it above the card on a phone). The gold runs on a Web Animations clock ("gold flow"), so the gallery timeline and the Pause button (`aria-pressed`) both stop it.

## Do

- Keep the background dark and warm: gold only reads as gold against shadow.
- Leave the blobs room to rise and sink away from the text.

## Do not

- Do not use it for silver or chrome: the warm light and the heat glow are tuned for hot gold.
- Do not put two on one page: each holds a live WebGL context.

## Reduced motion

One still frame is drawn, with the blobs part way through merging, and nothing moves; the Pause button hides. Without WebGL or script, the canvas keeps a CSS still: three gold drops with a warm glow on the dark base.

## How it works

- A metaball field: `F = sum of r^2 / (|p - c|^2 + e)` over seven blobs, gold where `F > 1`. The small `e` softens the centres so nothing overflows at `mediump`. Its gradient is summed analytically alongside it.
- `(F - 1) / |grad F|` estimates the distance to the edge, which gives a rim antialiased to about one pixel and places the heat glow just outside.
- The surface height is `1 - 1 / F`: zero at the edge and flat on top, so the normal comes from `grad F / F^2` with no finite differences. It reflects an analytic environment (a softbox above, a warm light from the left, a lit wall behind the viewer, a dark floor with ember glow) tinted by the gold, with Schlick Fresnel brightening the rim.
- Blob positions are worked out in JS each frame: every blob rides its own sine at a whole multiple of one loop angle (lingering near the top and bottom like lava lamp wax), so the loop has no seam.
- The drawing buffer is at most 1.5 times the CSS size, 1 times if the first 30 frames average over 20 ms. Drawing stops off screen, in a hidden tab and while paused, the context is released on `pagehide` and rebuilt after `webglcontextlost`.
