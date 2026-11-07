# Cover stack

Covers fall one at a time and land flat in a growing, slightly messy stack, each settling at the real height of the pile with no bounce.

[Live demo](https://motion.rujilabs.com/patterns/cover-stack/) · [style.css](style.css) · [cover-stack.js](cover-stack.js)

## Use

```html
<div class="cs-scene"><div class="cs-table">
  <article class="cs-cover" >Issue 11</article>
</div></div>
```

## Options

| Name | What it does |
|---|---|
| `--i` | Place in the pile, also sets height and delay |
| `--tw, --dx, --dy` | How messy the landing is. Keep twist under 10 degrees |

## Do

Put the newest or best cover last, since it ends on top and stays visible.

## Do not

Do not bounce: flat paper does not bounce. Do not stack more than about 8, since only the top one stays readable.

## Reduced motion

The finished stack shows at once.
