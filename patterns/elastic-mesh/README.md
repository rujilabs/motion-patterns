# Elastic mesh

Use when: a mattress shop lets visitors press the quilted top on screen and watch it dent under the hand and spring back when they let go.

A quilted fabric sits on a spring grid. Press it (mouse button, pen or finger) and it dents under the press, the diamond quilting and the stitching pulled into the hollow; drag and the dent follows; let go and the fabric springs back with a soft overshoot. A mouse that only hovers presses lightly, so the fabric answers before the click. When nobody touches it, an unseen hand presses it at four places in turn, each held about 1.6 seconds. Only presses that start on the fabric itself count, not on the content over it.

[Live demo](https://motion.rujilabs.com/patterns/elastic-mesh/) · [style.css](style.css) · [elastic-mesh.js](elastic-mesh.js)

## Use

```html
<link rel="stylesheet" href="elastic-mesh/style.css">
<script src="elastic-mesh/elastic-mesh.js" defer></script>

<section class="elasticmesh">
  <canvas class="em-canvas" aria-hidden="true"></canvas>
  <div class="card">...the product, the price, the button...</div>
  <button type="button" class="em-pause" aria-pressed="false" hidden>Pause</button>
</section>
```

Give the `.elasticmesh` a size. Put the content on solid panels: the fabric is light and busy, and text straight on it would be hard to read. The script shows the Pause button only when the fabric can move.

## Options

| Name | What it does | Default |
|---|---|---|
| `--em-fabric` | The knit colour (6 digit hex) | `#e4e8ec` |
| `--em-thread` | The stitching colour (6 digit hex) | `#8d9cab` |
| `--em-quilt` | Quilted cells across the area's height (2 to 14) | `6` |

All three are read on every resize, so a media query can change them (the demo uses smaller cells on phones). The idle presses run on a Web Animations clock ("quilted fabric"), so the gallery timeline and the Pause button (`aria-pressed`) both stop them; the fabric still answers a real press while paused. The area keeps `touch-action: pan-y`: a sideways drag presses and moves the dent, a vertical swipe still scrolls the page (and lets the fabric go).

## Do

- Say what to do in a small label ("Press the fabric"): a soft surface does not look pressable.
- Keep the cells large enough to read as quilting, about 60 to 90 px.

## Do not

- Do not put buttons or links straight on the fabric where people press: presses that start on them are ignored, which feels dead.
- Do not put two on one page: each holds a live WebGL context and its own simulation.

## Reduced motion

The script lets the fabric settle under one press in memory and draws that single still frame, a dent in the upper right. Nothing moves and there is no Pause button. Without WebGL or script, the canvas shows a still diamond stitching drawn in CSS.

## How it works

- A 32 by 24 grid of heights and speeds in JS, with the outer ring held flat. Each node feels its four neighbours (the discrete Laplacian, like a stretched membrane, stiffness 46), a spring back to flat (70) and damping (5.5). The hand is a Gaussian 64 px wide: wherever its shape lies below the fabric, a stiff spring (900) pulls the fabric down onto it, so the dent takes the hand's shape. Letting go leaves only the springs, which bring the fabric back past flat and settle it.
- Two half steps of semi-implicit Euler per frame. Heights and slopes (central differences on the grid) are packed into a 32 by 24 texture each frame and read with linear filtering, so the shader never takes differences itself.
- The quilting is a diamond grid: each cell is a pillow `(1 - 4u^2)(1 - 4v^2)` whose slope is written out exactly, with tufts where four pillows meet, dashed stitching along the seams (antialiased by the pixel size) and a fine knit that fades out before it gets smaller than a few pixels. The whole pattern is read at a point shifted by the dent's slope, so it is pulled into the hollow.
- The light is a soft wrapped diffuse light from the top left on the summed normal of the dent and the pillows; the dent also darkens with depth.
- The drawing buffer is at most 1.5 times the CSS size, 1 times if the first 30 frames average over 20 ms. Drawing stops off screen, in a hidden tab and once the fabric is still while paused, the context is released on `pagehide` and rebuilt after `webglcontextlost`.
