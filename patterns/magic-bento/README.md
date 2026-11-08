# Magic bento

Use when: a product page shows five or six features as a bento grid of cards, and the grid should answer the hand without any card jumping around.

The card borders light up near the pointer, as if one lamp moved over the whole grid. There is one shared light position; each card shifts it by its own place in the grid, so the card under the pointer glows on the near edge, its neighbours catch the rim of the light and cards further off stay dark. A fainter wash of the same light falls on the card face.

[Live demo](https://motion.rujilabs.com/patterns/magic-bento/) · [style.css](style.css) · [magic-bento.js](magic-bento.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="magic-bento/style.css">
<script src="magic-bento/magic-bento.js" defer></script>

<div class="mb">
  <a class="mb-card" href="#e-invoice">
    <span>e-Invoice</span>
    <strong>1,284</strong>
    <span>e-Invoices sent in October.</span>
  </a>
  <!-- more cards -->
</div>
```

Lay the grid out yourself on `.mb` (a CSS grid with spans) and give the cards a `border-radius`; the ring follows it. The cards can be links, buttons or plain boxes; the ones that take focus light up when focused.

## Options

| Name | What it does | Default |
|---|---|---|
| `--mb-glow` | Colour of the light | `#6d5dfc` |
| `--mb-r` | Radius of the light, in px | `240px` |
| `--mb-edge` | Width of the lit border | `1.5px` |

The script writes `--mb-x` and `--mb-y` on the grid once a frame while the pointer moves, and `--mb-cx` / `--mb-cy` on each card only when the layout changes, so moving the pointer costs one style write. A finger dragged over the grid works too (the grid keeps `touch-action: pan-y`, so the page still scrolls) and the light stays for a moment after it lifts.

## Do

- Use it on a dark surface: a light on a light card barely shows.
- Keep the radius near the size of one small card, so the light reads as one lamp, not a flood.

## Do not

- Do not use it on a grid people scan to read, like a price table: the moving light pulls the eye.
- Do not put it inside an element that clips the card edges (`overflow: hidden` on the grid): the ring sits on the border.

## Reduced motion

The light still follows the pointer, since it only moves when the hand does, but it switches on and off at once instead of fading.
