# Dither wave

Use when: a record shop, zine store or print studio wants a hero where a moving gradient is drawn in an ordered 4 by 4 (Bayer) dither, like a riso print or an old screen.

A WebGL fragment shader draws a slow gradient in three inks (dark, middle, paper) and prints it as a grid of square cells, each cell choosing its ink from the classic 4 by 4 Bayer threshold matrix. A pool of light with fine grooves, like a record, follows the pointer or a finger; when nobody points it drifts on its own. The gradient loops every 40 seconds.

[Live demo](https://motion.rujilabs.com/patterns/dither-wave/) · [style.css](style.css) · [dither-wave.js](dither-wave.js)

## Use

```html
<link rel="stylesheet" href="dither-wave/style.css">
<script src="dither-wave/dither-wave.js" defer></script>

<section class="dither" data-dw-pixel="3">
  <canvas class="dw-canvas" aria-hidden="true"></canvas>
  <div class="card">
    <h1>Crate dig weekend: 1,284 used LPs, every one graded.</h1>
    <p>Saturday 14 and Sunday 15 November, 11:00 am to 9:30 pm</p>
    <a href="/arrivals">See this week's arrivals</a>
  </div>
  <button type="button" class="dw-pause" aria-pressed="false" hidden>Pause</button>
</section>
```

The canvas fills the `.dither` behind its content and the whole `.dither` follows the pointer (`touch-action: pan-y`, so a finger can still scroll the page). Put the copy on a solid card: a dither is busy by design. The script shows the Pause button only when the gradient can move.

## Options

| Name | What it does | Default |
|---|---|---|
| `data-dw-pixel` | Size of one dither cell, in CSS px (2 to 8) | `3` |
| `--dw-ink` | The darkest ink (6 digit hex) | `#1a1714` |
| `--dw-mid` | The middle ink (6 digit hex) | `#d6452b` |
| `--dw-paper` | The paper, the lightest (6 digit hex) | `#efe4cf` |

The gradient runs on a Web Animations clock ("dither drift"), so the gallery timeline and the Pause button (`aria-pressed`) both stop it. While paused, the pool still follows a pointer you move, and settles when you stop.

## Do

- Pick three inks with clear steps between them, dark to light. The dither only reads when its neighbours differ.
- Keep the cell size at 2 to 4 px for a fine print, 6 to 8 px for a chunky screen look.

## Do not

- Do not put text straight on the dither. Use a solid card.
- Do not put two on one page: each holds a live WebGL context.

## Reduced motion

One still frame of the dither is drawn with the pool resting to the right, and nothing moves; the pointer does nothing and the Pause button hides. Without WebGL or script, the canvas keeps a CSS still: the same three inks as a soft diagonal and glow under a fine dot screen.

## How it works

- One full-screen triangle; the fragment shader does all the work.
- The pixel is floored to its dither cell and everything is read at the cell centre, so each cell is one flat ink.
- The gradient is two sines over a domain-warped plane: the coordinates are pushed by two more sines before they are read. Every time term is a whole multiple of one angle that runs 0 to 2 pi over the loop, so it has no seam and stays precise at `mediump`.
- The pool round the pointer is a Gaussian, with a sine of the distance on top for the grooves.
- The Bayer matrix (0 8 2 10 / 12 4 14 6 / 3 11 1 9 / 15 7 13 5, each over 16) sits in a 4 x 4 texture with nearest filtering. Each cell takes its threshold t from it and picks ink number floor(value x 2 + t): 0 ink, 1 middle, 2 paper. That is ordered dithering between three levels.
- The pointer is eased toward its target. The drawing buffer is at most 1.5 times the CSS size, 1 times if the first 30 frames average over 20 ms. Drawing stops off screen, in a hidden tab and when paused and settled, the context is released on `pagehide` and rebuilt after `webglcontextlost`.
