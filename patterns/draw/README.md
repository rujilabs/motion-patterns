# Draw

Lines that draw themselves: SVG strokes, text underlines and link hovers.

[Live demo](https://motion.rujilabs.com/patterns/draw/) · [style.css](style.css)

## Use

SVG strokes need `pathLength="1"` on every path and a trigger (`data-play` plus [`play.js`](../../play.js)):

```html
<svg class="draw" data-play viewBox="0 0 300 40" aria-hidden="true">
  <path pathLength="1" d="M6 26 C60 8 110 36 160 20 S250 10 294 22"
        fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
</svg>
```

A text underline needs no SVG:

```html
<h1 data-play>Signed, sealed, <span class="draw-line">delivered</span></h1>
```

## Variants

| Class | On | What it does |
|---|---|---|
| `.draw` | `svg` | Every path draws over 1.6s once `.go` arrives |
| `.draw-seq` | `svg` with `.draw` | Paths draw in order, each starting halfway through the one before (up to 5) |
| `.draw-line` | inline text | Background underline drawn left to right; wraps across lines. Tune with `--line-w` (thickness) and `--line-y` (lift) |
| `.draw-hover` | link | Underline draws in from the left on hover or focus and leaves to the right |

## Do

- Keep `pathLength="1"` on every path. It makes every stroke take the same time whatever its length, and removes magic numbers like `stroke-dasharray: 1400`.
- Give a drawn signature or illustration a `role="img"` and an `aria-label`; mark decorative underlines `aria-hidden="true"`.

## Do not

- Draw body text links on load. Use `.draw-hover` so the line appears when the reader shows interest.
- Draw more than one large illustration per screen; they compete for attention.

## Reduced motion

Strokes and underlines show complete; the hover underline appears without a transition.

## Without JavaScript

Hidden start states only apply under `.js`, which `play.js` sets. Without it, every line is already drawn.
