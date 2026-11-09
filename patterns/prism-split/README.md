# Prism split

Use when: an optician, lens lab or eye clinic wants a hero where a beam of light enters a glass prism and fans out into a spectrum that follows the visitor's pointer.

A WebGL fragment shader draws a dark shop wall, a glass prism and a beam of white light from a lamp low on the left. The beam enters the prism, starts to split inside the glass, and leaves the far face as a fan of colour: red bent least, violet bent most. Move the pointer and the fan swings toward it while the prism turns a little with it. Dust in the air drifts through the light and makes it shimmer. When nobody points, the fan sways slowly on its own, so the effect shows without a mouse.

[Live demo](https://motion.rujilabs.com/patterns/prism-split/) · [style.css](style.css) · [prism-split.js](prism-split.js)

## Use

```html
<link rel="stylesheet" href="prism-split/style.css">
<script src="prism-split/prism-split.js" defer></script>

<section class="prism">
  <canvas class="ps-canvas" aria-hidden="true"></canvas>
  <div class="card">
    <h1>Lenses cut in our own lab, ready in 45 minutes.</h1>
    <a href="#book">Book an eye test</a>
  </div>
  <button type="button" class="ps-pause" aria-pressed="false" hidden>Pause</button>
</section>
```

The canvas fills the `.prism` behind its content. Keep the text on a solid card away from the prism. The script shows the Pause button only when the light can move.

## Options

| Name | What it does | Default |
|---|---|---|
| `--ps-room` | The dark wall (6 digit hex) | `#15110d` |
| `--ps-glass` | Glass tint and rim light (6 digit hex) | `#d8ece8` |
| `--ps-x`, `--ps-y` | Prism centre, as shares of the width and height | `.64`, `.46` |
| `--ps-size` | Prism half side, as a share of the scene size (the smaller of the height and three quarters of the width) | `.16` |

The script reads the custom properties on every resize, so a media query can move the prism on a phone (the demo puts it top left at `.3`). The dust runs on a Web Animations clock ("prism dust"), so the gallery timeline and the Pause button (`aria-pressed`) both stop it; the fan still follows a real pointer while paused. On touch a finger dragged across the hero swings the fan, and the hero keeps `touch-action: pan-y`, so the page still scrolls.

## Do

- Keep the wall dark. A spectrum only reads against a dark ground.
- Let the fan point into empty space, not across the prices.

## Do not

- Do not add a second prism or a second beam: one light path is the whole idea.
- Do not put two on one page: each holds a live WebGL context.

## Reduced motion

One still frame is drawn with the fan a little below its rest angle, and nothing moves; the Pause button hides. Without WebGL or script, the canvas keeps a CSS still: a thin white beam meets the prism spot and leaves it as a spectrum fan on the dark wall.

## How it works

- One full-screen triangle; the fragment shader does all the work.
- The prism is the signed distance field of an equilateral triangle, turned by the prism angle. The distance gives the rim light (an exponential of its absolute value) and the inside mask.
- The light path is worked out in JS from the prism corners: entry and exit points 0.58 of the way down each face. The shader draws each leg as a Gaussian of the distance to a segment, a sharp core plus a soft halo.
- The fan is polar round the exit point: the angle from the fan's centre line, divided by the fan width, picks the colour from three Gaussian bumps in red, green and blue (with a little red again at the violet end). Brightness falls off exponentially with distance.
- Dust is value noise (a 64 x 64 random texture read with linear filtering on smoothstepped coordinates) whose offset runs round a circle, so the loop has no seam. A sine along each ray, with its phase worked out in JS, makes the light shimmer outward.
- The drawing buffer is at most 1.5 times the CSS size, 1 times if the first 30 frames average over 20 ms. Drawing stops off screen, in a hidden tab and while paused, the context is released on `pagehide` and rebuilt after `webglcontextlost`.
