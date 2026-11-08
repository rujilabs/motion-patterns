# Magnet needles

A grid of compass needles that turn to point at the pointer, for a hero that should feel measured and exact (a land surveyor, a map maker, a navigation course). Each needle is a damped rotary spring with a damping ratio of .32, so it overshoots and settles in two or three wobbles like a real compass. Needles near the pointer are stiffer and snap round first; far ones follow. When the pointer leaves, they all swing back to north. A focused link or button pulls them the same way, and on first view one pass of the magnet crosses the grid (2 s, a Web Animation).

[Live demo](https://motion.rujilabs.com/patterns/magnet-needles/) · [style.css](style.css) · [magnet-needles.js](magnet-needles.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="magnet-needles/style.css">
<script src="magnet-needles/magnet-needles.js" defer></script>

<section class="needle-field">
  <h1>Know exactly where your boundary stones are.</h1>
  <a href="#quote" data-mn-rest>Get a quote</a>
  <canvas class="mn-canvas" aria-hidden="true"></canvas>
</section>
```

The pointer is tracked over the whole `.needle-field`, so the needles follow it across the copy too. Put the canvas anywhere inside it and give it a height.

## Options

| Name | What it does | Default |
|---|---|---|
| `--mn-gap` | Space between needles; the needle is about 72% of it | `34px` |
| `--mn-tip` | The north half | Red |
| `--mn-tail` | The south half | Grey |
| `--mn-pin` | The pivot dot | Ink |
| `data-mn-rest` | On an element inside the field: the still frame points every needle at it | north |

A finger dragged across the field pulls the needles. The field keeps `touch-action: pan-y`, so the page still scrolls.

## Do

- Point `data-mn-rest` at the main call to action: the still frame then reads as an arrow to it.
- Keep the needles in a panel of their own. A full-page grid of them is busy.

## Do not

- Do not set `--mn-gap` below about 22px: the needles start to touch when they turn.
- Do not use it behind body text. Needles are thin, high contrast marks.

## Reduced motion

The needles are drawn once, all pointing at the `data-mn-rest` element (or north), and never move. Without the script the canvas shows them pointing north as a CSS pattern.
