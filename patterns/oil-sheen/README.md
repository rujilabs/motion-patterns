# Oil sheen

Use when: a car detailing or ceramic coating page wants its hero to look like freshly coated paint, a thin-film rainbow sheen that shifts as you move, the way the colours change when you walk round the car.

A WebGL fragment shader draws a dark glossy panel with the reflection of a two-tube studio softbox. Over it a thin-film sheen drifts slowly, the colours of a coat or of oil on water. Near the pointer you look through the film at a slant, so the colours there shift and brighten and the softbox lines move with it. When nobody points, a slow unseen hand walks the light round the panel.

[Live demo](https://motion.rujilabs.com/patterns/oil-sheen/) · [style.css](style.css) · [oil-sheen.js](oil-sheen.js)

## Use

```html
<link rel="stylesheet" href="oil-sheen/style.css">
<script src="oil-sheen/oil-sheen.js" defer></script>

<section class="sheen">
  <canvas class="os-canvas" aria-hidden="true"></canvas>
  <div class="copy">
    <h1>9H ceramic coating that water slides off.</h1>
    <a href="#book">Book Thu 12 Nov, 9:30 am</a>
  </div>
  <button type="button" class="os-pause" aria-pressed="false" hidden>Pause</button>
</section>
```

The canvas fills the `.sheen` behind its content. Put the text on a dark panel. The script shows the Pause button only when the sheen can drift.

## Options

| Name | What it does | Default |
|---|---|---|
| `--os-paint` | The paint under the coat (6 digit hex) | `#0d1015` |
| `--os-light` | The studio light it reflects (6 digit hex) | `#e8eefc` |

The rainbow has no colour option on purpose: it comes from the interference maths, and that is what makes it read as a real coat. The drift runs on a Web Animations clock ("sheen drift"), so the gallery timeline and the Pause button (`aria-pressed`) both stop it; the sheen still follows the real pointer while paused. On touch a finger dragged across the panel moves it, and the panel keeps `touch-action: pan-y`, so the page still scrolls.

## Do

- Keep the paint dark. Thin-film colour only shows against a deep base.
- Use it on the one page where the finish is the product.

## Do not

- Do not raise the glow until the panel is all rainbow. A coat is a sheen on paint, not a disco.
- Do not put two on one page: each holds a live WebGL context.

## Reduced motion

One still frame is drawn with the light to the upper right, and nothing drifts or follows the pointer; the Pause button hides. Without WebGL or script, the canvas keeps a CSS still: the paint, a faint softbox line and a soft rainbow patch.

## How it works

- One full-screen triangle; the fragment shader does all the work.
- Film thickness is fbm value noise, three octaves, with a domain warp (the noise read at a point pushed by two more noise reads). The noise comes from a 64 by 64 random texture filled once in JS from a fixed seed; the GPU's linear filter does the interpolation, on a smoothstepped cell position so the grid does not show.
- The film drifts round a circle in noise space (`offset = 1.6 (cos a, sin a)`), so the loop has no seam.
- Colour is two-beam interference: `0.5 + 0.5 cos(2 pi path / wavelength)` for red, green and blue wavelengths in the ratio 1 : 1.18 : 1.38. The path grows with the thickness and with the slant of view, which is highest round the pointer. The result is pulled a little toward grey and squared, so the sheen sits in the paint.
- The softbox is two thin lines and a wide soft band on one diagonal, nudged by the pointer's height and tinted by the film.
- The drawing buffer is at most 1.5 times the CSS size, 1 times if the first 30 frames average over 20 ms. Drawing stops off screen and in a hidden tab, the context is released on `pagehide` and rebuilt after `webglcontextlost`.
