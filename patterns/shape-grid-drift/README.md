# Shape grid drift

A drafting grid of squares drifts slowly down and to the right behind a hero, with a heavier line every 4 cells. The cell under the pointer fills, and the cells it leaves fade out behind it. When nobody points, a cell on the right now and then fills on its own, so the hero is never dead.

[Live demo](https://motion.rujilabs.com/patterns/shape-grid-drift/) · [style.css](style.css) · [shape-grid-drift.js](shape-grid-drift.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="shape-grid-drift/style.css">
<script src="shape-grid-drift/shape-grid-drift.js" defer></script>

<section class="sgd" data-sgd-speed="9">
  <canvas class="sgd-canvas" aria-hidden="true"></canvas>
  <div class="copy">
    <h1>Shophouse repairs and new homes on narrow lots.</h1>
  </div>
  <button type="button" class="sgd-pause" aria-pressed="false" hidden>Pause</button>
</section>
```

Give `.copy` `position: relative; z-index: 1` and a solid background, so the grid lines never run through the words. The script shows the Pause button only when the drift can run.

## Options

| Name | What it does | Default |
|---|---|---|
| `--sgd-cell` | Size of one square; read again on resize, so set a smaller one in a phone media query | `56px` |
| `data-sgd-speed` | Drift in px a second | `9` |
| `--sgd-line`, `--sgd-major` | Grid lines and every 4th line | Light and mid grey |
| `--sgd-fill` | The filled cell | Terracotta |

The drift runs on a Web Animations clock ("grid drift"), so the gallery timeline and the Pause button (`aria-pressed`) both stop it. Filled cells belong to the grid, so they drift with it. At most 24 cells are filled or fading at once, from arrays made once. Drawing stops off screen, in a hidden tab, and when paused with nothing fading. On touch the area keeps `touch-action: pan-y`.

## Do

- Keep the drift slow, under about 15 px a second. It should be noticed late, not watched.
- Use one fill colour, the brand's.

## Do not

- Do not put long text straight on the grid. A panel behind the copy keeps it readable.
- Do not use it on more than one section of a page.

## Reduced motion

The grid stands still and the Pause button hides. The cell under the pointer still fills, with no fade.
