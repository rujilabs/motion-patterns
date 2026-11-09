# Ripple grid

Use when: a koi farm, aquarium shop or water garden wants a hero where a lit grid on dark water ripples out from every tap, like a pond.

A WebGL fragment shader draws a lit grid floating on dark pond water, a lantern at every crossing, with two koi swimming slow loops under it. Tap or click anywhere on the pond and a ripple runs out in rings: the grid and the fish bend where the water slopes, the crests light up and a glint of sky slides over each ring. Up to four of your ripples run at once and cross each other. From the keyboard, the "Feed the koi" button drops one just in front of a fish. When nobody taps for a few seconds, a drop falls now and then on its own.

[Live demo](https://motion.rujilabs.com/patterns/ripple-grid/) · [style.css](style.css) · [ripple-grid.js](ripple-grid.js)

## Use

```html
<link rel="stylesheet" href="ripple-grid/style.css">
<script src="ripple-grid/ripple-grid.js" defer></script>

<section class="ripplegrid" data-rg-cell="26">
  <canvas class="rg-canvas" aria-hidden="true"></canvas>
  <div class="card">
    <h1>Kohaku and showa, bred in our own mud ponds.</h1>
    <a href="#visit">Plan a visit</a>
  </div>
  <button type="button" class="rg-drop" hidden>Feed the koi</button>
  <button type="button" class="rg-pause" aria-pressed="false" hidden>Pause</button>
</section>
```

The canvas fills the `.ripplegrid` behind its content. Taps on links and buttons do not drop ripples. The script shows both buttons only when the pond can move.

## Options

| Name | What it does | Default |
|---|---|---|
| `data-rg-cell` | Grid pitch, in CSS px (12 or more) | `26` |
| `--rg-water` | Pond water (6 digit hex) | `#0a1c19` |
| `--rg-line` | The lit grid and its lanterns (6 digit hex) | `#f0c26a` |
| `--rg-koi` | Koi markings (6 digit hex) | `#ff6a2b` |
| `--rg-pond` | Where the koi swim, as shares of the width and height | `.72 .5` |

The script reads the custom properties on every resize, so a media query can move the koi on a phone (the demo moves them up to `.6 .22`). The koi and the idle drops run on a Web Animations clock ("koi pond"), so the gallery timeline and the Pause button (`aria-pressed`) both stop them; a ripple you drop yourself still plays out while paused. Touch works as a tap, and the pond keeps `touch-action: pan-y`, so the page still scrolls.

## Do

- Keep the grid fine and dim: it is a surface to bend, not the content.
- Give the keyboard the same toy: keep the drop button.

## Do not

- Do not drop ripples on every pointer move: it turns a calm pond into a boiling one.
- Do not put two on one page: each holds a live WebGL context.

## Reduced motion

One still frame is drawn with two rings frozen part way out beside the koi, and nothing moves; the Pause and drop buttons hide. Without WebGL or script, the canvas keeps a CSS still: the grid on dark water with one set of rings.

## How it works

- One full-screen triangle; the fragment shader does all the work.
- Each ripple is a wave packet: `sin(k f) * exp(-f^2 / w^2)` with `f = r - c t`, the distance behind a front moving out at speed c, damped with age and spread as `1 / (1 + 4 r)`. Its slope along r is written out exactly, and the slopes of up to six ripples (two idle, four of yours) add to give the gradient of the surface.
- Refraction: the grid and the koi are read at the pixel shifted against the gradient, so they bend under each ring. Slopes facing the light lift the grid and the water, a Blinn style glint uses the normal built from the gradient.
- The grid is drawn from the distance to the nearest line in a pixel's cell, with a Gaussian line and a Gaussian lantern at each crossing.
- Each koi is drawn in its own frame from distance functions: a tapered ellipse for the body, a widening fan for the tail that sways, two fins, and sine bands for the red markings. JS moves them on two loops and passes their heading.
- The drawing buffer is at most 1.5 times the CSS size, 1 times if the first 30 frames average over 20 ms. Drawing stops off screen, in a hidden tab and while paused (once your ripples finish), the context is released on `pagehide` and rebuilt after `webglcontextlost`.
