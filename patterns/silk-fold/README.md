# Silk fold

Use when: a songket, batik or silk boutique wants a hero where a sheet of silk folds slowly and catches the light.

A WebGL fragment shader draws a sheet of maroon silk with a fine gold diamond weave. The folds swell and slide over a 96 second cycle, the crests catch a soft sheen and a small bright highlight, and the weave bends and glints with each fold. The light follows the pointer, so moving across the hero turns the cloth in the hand; when nobody points, the light drifts on its own.

[Live demo](https://motion.rujilabs.com/patterns/silk-fold/) · [style.css](style.css) · [silk-fold.js](silk-fold.js)

## Use

```html
<link rel="stylesheet" href="silk-fold/style.css">
<script src="silk-fold/silk-fold.js" defer></script>

<section class="silk">
  <canvas class="sk-canvas" aria-hidden="true"></canvas>
  <div class="copy">
    <h1>Songket woven by hand, one sampin at a time.</h1>
    <a href="#fitting">Book a fitting</a>
  </div>
  <button type="button" class="sk-pause" aria-pressed="false" hidden>Pause</button>
</section>
```

The canvas fills the `.silk` behind its content. Put the text on a solid card, like a swing tag on the cloth. The script shows the Pause button only when the folds can move.

## Options

| Name | What it does | Default |
|---|---|---|
| `--sk-deep` | The fold shadows (6 digit hex) | `#22050f` |
| `--sk-silk` | The silk in full light (6 digit hex) | `#8c1430` |
| `--sk-sheen` | The sheen on the fold crests (6 digit hex) | `#e9b58a` |
| `--sk-gold` | The gold weave (6 digit hex) | `#d9a441` |

The folds run on a Web Animations clock ("silk folds"), so the gallery timeline and the Pause button (`aria-pressed`) both stop them; the light still follows the real pointer while paused. On touch a finger dragged across the hero moves the light, and the hero keeps `touch-action: pan-y`, so the page still scrolls.

## Do

- Take the colours from the cloth you sell: the deep, the silk, the sheen and the thread.
- Keep the card solid. The highlight moves, and text straight on silk would flicker in and out of contrast.

## Do not

- Do not speed the cycle up much. Silk that folds fast reads as water or flags.
- Do not put two on one page: each holds a live WebGL context.

## Reduced motion

One still frame is drawn with the light from the upper right, and nothing moves; the Pause button hides. Without WebGL or script, the canvas keeps a CSS still: soft diagonal folds in the same silk colours.

## How it works

- One full-screen triangle; the fragment shader does all the work.
- The cloth is a height field: three travelling sines at different angles, one of them with its phase bent by a fourth sine, so the folds swell and slide instead of scrolling past. Every time term is a whole multiple of one angle that runs 0 to 2 pi over the cycle, so the loop has no seam and stays precise at `mediump`.
- The slope comes from the derivative of those sines, written out by hand, not from finite differences, which would be noisy at `mediump`. The normal is `normalize(-0.22 slope, 1)`.
- Light is Lambert diffuse (squared, for a deeper fall-off) plus a wide sheen lobe `pow(n.h, 7)` and a tight highlight `pow(n.h, 70)`, with the fold valleys darkened by the height itself.
- The weave is drawn in cloth coordinates, the screen point pushed by the slope, so the diamonds bend over each fold: two sets of diagonal lines from `fract`, and a gold dot in each diamond, lit by the same sheen.
- The drawing buffer is at most 1.5 times the CSS size, 1 times if the first 30 frames average over 20 ms. Drawing stops off screen and in a hidden tab, the context is released on `pagehide` and rebuilt after `webglcontextlost`.
