# Badge

A notification count. It springs in from the corner that touches its icon when the count goes above zero, bumps once and rolls its digits when the number changes (up for more, down for fewer), and drops out quickly at zero.

[Live demo](https://motion.rujilabs.com/patterns/badge/) · [style.css](style.css) · [badge.js](badge.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="badge/style.css">
<script src="badge/badge.js"></script>

<button type="button" aria-label="Messages, none unread">
  <svg>...</svg>
  <span class="badge" data-count="0" hidden aria-hidden="true"><span class="badge-num">0</span></span>
</button>
```

```js
badge.set(el, 3);   // pops in
badge.set(el, 4);   // bumps, digits roll up
badge.set(el, 0);   // drops out, then hidden
```

Size, colour and place the badge yourself. Counts over 99 show as `99+`.

## Parts

| Class or property | What it does |
|---|---|
| `.badge-pop` | From scale 0 on the spring. Added when the count leaves zero |
| `.badge-bump` | Swells to 125% and settles, 420ms. Added on every other change |
| `.badge-out` | Falls to scale 0 in 200ms on `--ease-in` |
| `.badge-old`, `.badge-new` | The leaving and arriving digits. The script makes the old copy and removes it after |
| `--badge-origin` | Where it grows from. On an icon's top right corner use `0 100%` |
| `--badge-dir` | `1` rolls up, `-1` rolls down. Set by the script |

## Do

- Put the count in the button's own `aria-label` too (the demo updates "Messages, 4 unread"). The badge is `aria-hidden`.
- Keep the badge on the corner of its icon, outlined in the surface colour so it reads over any icon.

## Do not

- Bump for a change the reader caused one tap ago and is already looking at. Bump for news.
- Loop or pulse a badge to get attention. One bump per change is enough; a pulsing badge becomes wallpaper.

## Reduced motion

The badge appears, changes and disappears at once with the new number.
