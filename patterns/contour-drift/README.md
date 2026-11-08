# Contour drift

A survey-map look for a trail, hike or land page: contour lines behind the route card that drift slowly, as if the hills under them were breathing. The height map is five soft hills (one is a hollow) with a gentle warp, so they read as land and not as targets. Each hill moves on a small loop that comes round a whole number of times in one cycle (120 s by default), so the drift never jumps or resets. The lines are traced with marching squares on a 10 px grid about 25 times a second, and every fifth line is an index contour, drawn heavier, as on a printed map.

[Live demo](https://motion.rujilabs.com/patterns/contour-drift/) · [style.css](style.css) · [contour-drift.js](contour-drift.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="contour-drift/style.css">
<script src="contour-drift/contour-drift.js" defer></script>

<section class="contour-drift" data-cycle="120">
  <canvas class="cd-canvas" aria-hidden="true"></canvas>
  <article class="route">
    <h1>Bukit Sri Lanjut loop</h1>
    <p>6.8 km, 412 m of climb, about 3 h 20 min.</p>
    <button type="button" data-pause aria-pressed="false">Pause map</button>
  </article>
</section>
```

The canvas fills the `.contour-drift` behind its content. The script wires the `button[data-pause]` inside it: it toggles `aria-pressed` and its label.

## Options

| Name | What it does | Default |
|---|---|---|
| `data-cycle` | Seconds for the hills to come back to where they started | `120` |
| `--cd-line` | Contour lines | Sand |
| `--cd-index` | Every fifth line | Darker sand |
| `canvas.contours.pause()`, `.play()` | Stop and start it from your own code | |

Time runs on a Web Animation called "contour drift", so pausing or scrubbing that animation moves the map with it.

## Do

- Keep both line colours within a few shades of the background. It is a look, not a map anyone should read.
- Put the real route, distances and times in the card, in text.

## Do not

- Do not shorten `data-cycle` much below 60. Fast moving contours look like liquid, not land.
- Do not draw a real route on top of drifting lines: the trail would seem to move across the hill.

## Reduced motion

The lines are drawn once and stay put, and the pause button is hidden. Without the script the canvas shows rings round one summit as a CSS still.
