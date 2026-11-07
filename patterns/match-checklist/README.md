# Match checklist

Three rows tick in order: the circle fills, the check mark draws and the row brightens, then the agreed result appears.

[Live demo](https://motion.rujilabs.com/patterns/match-checklist/) · [style.css](style.css) · [match-checklist.js](match-checklist.js)

## Use

```html
<li class="mc-row"><span class="mc-dot"><svg viewBox="0 0 20 20"><path d="M5 10.5l3.4 3.4L15 7"/></svg></span>Order placed</li>
```

## Options

| Name | What it does |
|---|---|
| `--i` | Row order, sets the delay |
| `450ms step` | Time per row. Under 300 ms the eye cannot follow |

## Do

Use it when a real check just ran, and only after it passed.

## Do not

Do not fake progress: if the checks are still running, show that instead. Do not use more than about 5 rows.

## Reduced motion

All rows show ticked and the result is visible.
