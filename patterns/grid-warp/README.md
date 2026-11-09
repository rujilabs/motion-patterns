# Grid warp

Use when: a property listing wants its hero photo to bend like a rubber sheet under the visitor's pointer, a playful touch on the first picture of the house.

The listing photo is read into WebGL once and redrawn over itself. Where the pointer presses, the photo swells into a soft dent, shaded on its near and far sides, and a faint grid shows how the sheet stretches. Move the pointer and the sheet drags along with it, then springs back with a little wobble. When nobody points, a soft press drifts slowly over the photo on its own. The real `<img>` (with its alt text) stays in the page under the canvas.

The demo photo is an SVG drawn for this entry, [facade.svg](facade.svg): a row of double storey terrace houses.

[Live demo](https://motion.rujilabs.com/patterns/grid-warp/) · [style.css](style.css) · [grid-warp.js](grid-warp.js)

## Use

```html
<link rel="stylesheet" href="grid-warp/style.css">
<script src="grid-warp/grid-warp.js" defer></script>

<div class="gridwarp" data-gw-radius=".24">
  <img class="gw-photo" src="house-18.jpg" alt="Front of the house, number 18" width="1600" height="1000">
  <canvas class="gw-canvas" aria-hidden="true"></canvas>
  <button type="button" class="gw-pause" aria-pressed="false" hidden>Pause</button>
</div>
```

Give the `.gridwarp` a size (the photo is cropped to it like `object-fit: cover`, centred). The image must be served from the same origin as the page: WebGL cannot read a photo from another site, and then the plain photo simply stays. The script shows the Pause button only when the sheet can move.

## Options

| Name | What it does | Default |
|---|---|---|
| `data-gw-radius` | Size of the press, as a share of the photo height (0.08 to 0.5) | `.24` |
| `--gw-line` | The faint grid in the dent (6 digit hex) | `#ffffff` |

The idle press runs on a Web Animations clock ("rubber sheet"), so the gallery timeline and the Pause button (`aria-pressed`) both stop it; the sheet still follows a real pointer while paused. On touch a finger dragged across the photo presses it, and the photo keeps `touch-action: pan-y`, so the page still scrolls.

## Do

- Use it on one hero photo. It is a moment of play, not a way to browse a gallery.
- Keep the press soft: the buyer still needs to see the house.

## Do not

- Do not put labels or prices on the photo where the dent passes; put them on solid tags or below it.
- Do not use it on floor plans or anything that must be measured: the warp lies about sizes.
- Do not put two on one page: each holds a live WebGL context.

## Reduced motion

The script does not start: the plain photo shows, nothing moves and there is no Pause button. Without WebGL or script, and if the photo cannot be read, the plain photo shows too.

## How it works

- One full-screen triangle; the fragment shader reads the photo as a texture, cropped like `object-fit: cover`.
- The press is a Gaussian `G = exp(-r^2 / R^2)` round the pointer. The photo is read at `p - (p - m) * 0.45 d G - o G`: the first term pulls samples toward the centre, so the sheet swells (it never folds: the stretch stays positive at 0.45), and the second shifts them by the drag offset `o`.
- The drag offset is a damped spring in JS (stiffness 260, damping 16), kicked by how far the press moved each frame, so the sheet trails a moving pointer and wobbles back when it stops.
- The dent's height is `-d G`; its slope, written out exactly, shades the near side darker and the far side lighter. The grid lines are drawn in the warped coordinates, so they bend with the photo, and they only show inside the dent.
- The photo is drawn once into a 2D canvas at up to twice its size (crisp for an SVG) and uploaded as one texture.
- The drawing buffer is at most 1.5 times the CSS size, 1 times if the first 30 frames average over 20 ms. Drawing stops off screen, in a hidden tab and once settled while paused, the context is released on `pagehide` and rebuilt after `webglcontextlost`.
