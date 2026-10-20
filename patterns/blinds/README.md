# Blinds transition

The next view appears through slats, like window blinds. Two kinds: the new view shows through thin bands that widen until they meet, or a set of solid slats turns shut over the current view, one after another, and turns open again on the new one.

[Live demo](https://motion.rujilabs.com/patterns/blinds/) · [style.css](style.css) · [blinds.js](blinds.js)

## Use

Stack the views in a `.blinds-stack`, with an empty `.blinds-cover` last if you use the turning slats. The one on show has `.is-current`.

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="blinds/style.css">
<script src="blinds/blinds.js"></script>

<div class="blinds-stack" id="views" data-blinds>
  <figure class="is-current">One</figure>
  <figure>Two</figure>
  <div class="blinds-cover" aria-hidden="true"></div>
</div>
<button type="button" data-blinds-go="open" aria-controls="views">Next</button>
<button type="button" data-blinds-go="turn" aria-controls="views">Next</button>
```

## Kinds and options

| Class, attribute or property | What it does |
|---|---|
| `data-blinds-go="open"` | The next view shows through bands that widen from 0 to full. A repeating mask driven by a registered number, `--blinds-p` (900ms) |
| `data-blinds-go="turn"` | Solid slats turn shut, the view changes behind them, then they turn open the other way (600ms each way, slats `--stagger` / 2 apart) |
| `.blinds-v` on the stack | Upright slats for both kinds. A `data-blinds-v` checkbox with `aria-controls` toggles it |
| `--blinds-n` | Number of slats. Default 8 |
| `--blinds-color`, `--blinds-shade` | The two ends of the gradient on a turning slat |

The stack fires a `blindschange` event with the new index after each change.

## Do

- Use the turning slats where a room, a window or a shop front is the subject: the metaphor then carries.
- Keep the slat count between 6 and 12. Fewer reads as stripes, more as a flicker.

## Do not

- Run blinds on text-heavy views: half of each line is hidden for most of the move.
- Combine the two kinds on one product. The demo has both only to compare them.

## Reduced motion

`blinds.js` swaps the views at once, and the CSS drops every slat animation and the mask, so the next view simply appears.

## Browser support

The widening bands need `@property` (all current browsers). Without it the new view appears at the end of the move instead of opening in.
