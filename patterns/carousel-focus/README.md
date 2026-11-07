# Carousel focus

A 3D ring of panels turns one step at a time, and the front panel zooms toward the viewer and holds long enough to read before the ring moves on.

[Live demo](https://motion.rujilabs.com/patterns/carousel-focus/) · [style.css](style.css) · [carousel-focus.js](carousel-focus.js)

## Use

```html
<div class="cf-scene"><div class="cf-ring">
  <article class="cf-panel cf-0">Monday</article>
</div></div>
```

## Options

| Name | What it does |
|---|---|
| `--i` | Panel position in the ring |
| `--r` | Ring radius, needs to clear the panel width |
| `3s per panel` | Reading time. Change the 18s, the delay and the keyframes together |

## Do

Keep each panel to one short message, since it is only held for a moment.

## Do not

Do not use it for content people must compare side by side. It keeps moving, so always give a pause control.

## Reduced motion

The ring stays still with the first panel in front; the others show around it.
