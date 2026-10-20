# Shape transition

A solid shape sweeps in and covers the frame, the view changes underneath while it is hidden, then the shape moves on and uncovers the next view.

[Live demo](https://motion.rujilabs.com/patterns/shape-transition/) · [style.css](style.css) · [shape.js](shape.js)

## Use

The stack holds the views and one `.shape-cover` with three empty bands (the stripes shape uses all three, the others the first).

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="shape-transition/style.css">
<script src="shape-transition/shape.js"></script>

<div class="shape-stack" id="steps" data-shape>
  <section class="is-current">One</section>
  <section>Two</section>
  <div class="shape-cover" aria-hidden="true"><span></span><span></span><span></span></div>
</div>
<button type="button" data-shape-go="sweep" aria-controls="steps">Next</button>
```

## Shapes

| Value of `data-shape-go` | What it does |
|---|---|
| `sweep` | One band crosses from left to right: in from the left edge, out through the right |
| `stripes` | Three horizontal bands, each one `--stagger` (80ms) behind the last |
| `circle` | A disc grows from the centre, then shrinks back into it |

| Property | What it does |
|---|---|
| `--shape-color` | The colour of the cover. Default `currentColor` |

The stack fires a `shapechange` event with the new index at the moment of the swap.

## Do

- Use one brand colour for the cover. It reads as part of the product, not as an effect.
- Keep the whole run near a second. Each phase takes `--dur-base` (600ms).

## Do not

- Use it between every small step of a form: the cover hides the screen for a moment each time.
- Give the cover a pattern or gradient. A flat colour is what makes the swap invisible.

## Reduced motion

`shape.js` swaps the views at once and the cover never plays.
