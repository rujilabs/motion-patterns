# Pop

Springy scale-in for badges, dots, icons and stickers, plus a tactile press for buttons.

[Live demo](https://motion.rujilabs.com/patterns/pop/) · [style.css](style.css)

## Use

```html
<span class="badge pop">New</span>
<button class="pop-press">Add to cart</button>
```

Needs [`tokens.css`](../../tokens.css), which gives `--ease-spring` a real damped spring (CSS `linear()`) in browsers that support it and a cubic-bezier everywhere else.

## Variants

| Class or property | What it does |
|---|---|
| `.pop` | Scales from 60% with a spring while the opacity finishes in 200ms |
| `.pop-in` | The same, held until `play.js` adds `.go` |
| `.pop-press` | On `:active` the button shrinks to 96% in 80ms, then springs back on release |
| `--pop-origin` | Where the scale grows from. A count badge on an icon looks right with `--pop-origin: 0 100%` (its corner touching the icon) |

## Do

- Use it on small things: a badge, a dot, an icon, a sticker. Small things can bounce; big ones look like jelly.
- Stagger a group with `animation-delay` in steps of `--stagger`.

## Do not

- Pop text blocks, cards or images. Use [rise](../rise/) or [fade](../fade/).
- Put `.pop-press` on links that navigate; the page leaves before the spring is seen.

## Reduced motion

Elements show at full size at once, and the press does not scale.
