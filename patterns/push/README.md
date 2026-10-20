# Push transition

The next view pushes the current one off the frame in the same direction. The two views travel together, edge to edge, so the frame is never empty and the direction tells the reader which way they went: forward, back, up or down.

[Live demo](https://motion.rujilabs.com/patterns/push/) · [style.css](style.css) · [push.js](push.js)

## Use

Stack the views in a `.push-stack`. The one on show has `.is-current`. Buttons name the step and the stack they drive.

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="push/style.css">
<script src="push/push.js"></script>

<div class="push-stack" id="views" data-push>
  <section class="is-current">List</section>
  <section>Detail</section>
</div>
<button type="button" data-push-go="prev" aria-controls="views">Back</button>
<button type="button" data-push-go="next" aria-controls="views">Next</button>
```

Without `push.js`, put a direction class on the stack, `.push-out` on the current view and `.push-in` on the next, and swap `.is-current` on `animationend`.

## Options

| Class, attribute or property | What it does |
|---|---|
| `.push-left` on the stack | The next view enters from the right. The default, and what `next` uses |
| `.push-right` | Enters from the left. What `prev` uses |
| `.push-up`, `.push-down` | Enters from below or above |
| `data-push-axis` checkbox | With `aria-controls`, turns next and prev into up and down |
| `--push-dur` | Length of the push. Default `--dur-slow` (900ms) on `--ease-inout` |

The stack fires a `pushchange` event with the new index after each push.

## Do

- Match the direction to the structure: deeper into a list goes left, back out goes right.
- Keep both views the same size and background, so the seam between them reads as one strip.

## Do not

- Push between two views that are not neighbours in any order: the direction then lies.
- Shorten it below about 400ms on a wide frame: the eye loses the content in the blur.

## Reduced motion

`push.js` swaps the views at once, and the CSS drops both animations, so the next view simply replaces the current one.
