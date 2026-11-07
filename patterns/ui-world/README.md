# UI world

Interface panels hang at different depths in one space while the camera drifts between them, so real parallax shows how the parts sit together.

[Live demo](https://motion.rujilabs.com/patterns/ui-world/) · [style.css](style.css) · [ui-world.js](ui-world.js)

## Use

```html
<div class="uw-scene"><div class="uw-camera">
  <article class="uw-panel">Departures</article>
</div></div>
```

## Options

| Name | What it does |
|---|---|
| `translate3d on each panel` | Sets where it hangs. Spread z by at least 50 px or there is no parallax |
| `14s duration` | One drift. Slower reads calmer |

## Do

Use it behind a heading or as a section opener, with short panel text.

## Do not

Do not make people read long text while it drifts. It keeps moving, so always give a pause control.

## Reduced motion

The camera stays still and every panel is in place.
