# Mask transition

The next view is revealed through a mask that grows until it covers the frame: a circle from the point you clicked, a straight diagonal edge, or a letter that grows until its crossbar fills the screen.

[Live demo](https://motion.rujilabs.com/patterns/mask-transition/) · [style.css](style.css) · [mask.js](mask.js)

## Use

Stack the views in a `.mask-stack`. The one on show has `.is-current`. Buttons name the shape and the stack they drive.

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="mask-transition/style.css">
<script src="mask-transition/mask.js"></script>

<div class="mask-stack" id="views" data-mask>
  <section class="is-current">One</section>
  <section>Two</section>
</div>
<button type="button" data-mask-go="circle" aria-controls="views">Next</button>
```

Keep `letter.svg` next to `style.css`, or point the `mask` url at your own shape.

## Shapes

| Class on the incoming view | What it does | Use for |
|---|---|---|
| `.mask-circle` | A circle grows from `--mask-x` / `--mask-y` to `--mask-r`. `mask.js` sets them so the circle starts under the pointer and just reaches the farthest corner | Theme switches, opening a detail from a tap |
| `.mask-diagonal` | A straight edge sweeps from the top left to the bottom right | Moving to the next step in a sequence |
| `.mask-letter` | The view shows inside a letter that appears, then grows on an accelerating curve until its crossbar covers the frame | One brand moment, such as a title card |

Without `mask.js`, set the three properties yourself and add `.mask-in` with a shape class; remove them on `animationend`.

The stack fires a `maskchange` event with the new index after each swap.

## Do

- Grow the circle from the thing that was tapped: the eye is already there.
- Pick one shape per product and keep it.

## Do not

- Mask a view that holds text the reader is in the middle of. It vanishes in pieces.
- Use the letter shape for everyday navigation: it takes about 1.3 seconds, which is long for a common step.

## Reduced motion

`mask.js` swaps the views at once, and the CSS drops every mask animation, so the next view simply appears.
