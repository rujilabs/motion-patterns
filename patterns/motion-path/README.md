# Motion path

An object travels along a curve and turns to follow it, the way a rider follows a road. `offset-path` holds the curve, `offset-distance` runs along it, and `offset-rotate: auto` keeps the object pointing where it is going. A trail draws behind it on the same curve and clock.

[Live demo](https://motion.rujilabs.com/patterns/motion-path/) · [style.css](style.css)

## Use

Draw the curve once in an SVG whose `viewBox` equals its size in px, and give the traveller the same `d`. Put both at the top-left corner of one positioned box.

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="motion-path/style.css">

<div class="map">
  <svg viewBox="0 0 300 170" width="300" height="170">
    <path class="motion-trail" pathLength="1" d="M 26 140 C 70 140 …"/>
  </svg>
  <span class="rider motion-path">…art pointing right…</span>
</div>
```

```css
.map { position: relative; width: 300px; height: 170px; }
.map svg, .rider { position: absolute; top: 0; left: 0; }
.rider { --mp-path: path("M 26 140 C 70 140 …"); }
```

## Options

| Class or property | What it does |
|---|---|
| `.motion-path` | Travels the whole of `--mp-path` and stays at its end |
| `.motion-trail` | On an SVG path with `pathLength="1"`: draws along the same curve in step with the traveller |
| `.motion-in` | Add next to either: held until `play.js` adds `.go` |
| `--mp-dur` | The trip, default `2.4s` |
| `--mp-rotate` | `auto` (default) for art pointing right; `auto 90deg` for art pointing up; `0deg` to stay upright |

## Do

- Draw the traveller pointing right. That is the direction `auto` lines up with the curve.
- Keep the curve and the box at fixed px sizes. `path()` does not scale with its box; for a fluid map, scale the whole box.

## Do not

- Use it for a straight move. A translate is simpler and reads the same.
- Make the curve wiggle hard. Tight turns spin the traveller faster than people can follow.

## Reduced motion

The traveller sits at the end of the route and the trail is drawn in full; the replay button does nothing.
