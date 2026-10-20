# Pixelate

The view breaks into bigger and bigger blocks of colour, the next view takes its place at the coarsest step, then it resolves block size by block size until it is sharp. Five steps each way: 5, 9, 15, 23 and 33 px blocks.

[Live demo](https://motion.rujilabs.com/patterns/pixelate/) · [style.css](style.css) · [pixelate.js](pixelate.js)

## Use

The blocks come from five SVG filters that must be in the same page (browsers do not load CSS filters from another file). Copy the hidden `<svg>` with the `px-5` to `px-33` filters from the top of [index.html](index.html), then:

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="pixelate/style.css">
<script src="pixelate/pixelate.js"></script>

<div class="pixelate-stack" id="worlds" data-pixelate>
  <figure class="is-current">One</figure>
  <figure>Two</figure>
</div>
<button type="button" data-pixelate-go aria-controls="worlds">Next</button>
```

Each filter samples one point per cell (a 1px dot tiled across the view, kept only where the view is) and spreads that colour over the whole cell (a dilate of half the cell). Cells are odd sizes so the spread squares meet exactly.

## Options

| Class or property | What it does |
|---|---|
| `.pixelate-out` | Sharp to 33px blocks, on the current view |
| `.pixelate-in` | 33px blocks to sharp, on the next view |
| `--pixelate-dur` | Length of each half. Default `--dur-base` (600ms), so 1.2s in all |

Filter urls do not blend from one to the next, so each keyframe is a hard step. Keep the timing `linear`: an ease would only bunch the steps together.

The stack fires a `pixelatechange` event with the new index.

## Do

- Use it where the content is already a picture or a game screen: it reads as the image itself changing.
- Keep the views about the same size as the demo. On a full-screen view raise the block sizes, or the coarsest step still looks sharp.

## Do not

- Pixelate text the reader needs: it is unreadable for the whole move.
- Run it on a large area on a slow device every few seconds. Each step re-filters the whole view.

## Reduced motion

`pixelate.js` swaps the views at once, and the CSS drops both animations, so the next view simply replaces the current one.
