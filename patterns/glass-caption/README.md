# Glass caption

A caption on frosted glass slides in over a moving scene and stays readable, with a solid fallback where backdrop-filter is missing.

[Live demo](https://motion.rujilabs.com/patterns/glass-caption/) · [style.css](style.css) · [glass-caption.js](glass-caption.js)

## Use

```html
<div class="glass-caption">Open today 9:30 am to 6:00 pm</div>
```

## Options

| Name | What it does |
|---|---|
| `blur(22px)` | Frost strength. Below 12 px the text behind starts to compete |
| `saturate(1.5)` | Keeps colour alive through the glass |

## Do

Check the contrast against the brightest frame behind it, and keep the caption short.

## Do not

Do not stack glass on glass, and do not use it over a still white page, where it only looks grey.

## Reduced motion

The caption is already in place and the background stays still.
