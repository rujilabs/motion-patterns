# Warp tunnel

Use when: an overnight bus or coach booking page wants its search to feel like the night road, light streaks rushing past that go faster while "Search trips" is held.

A WebGL fragment shader draws a tunnel of light streaks, street lamps, headlights and the odd tail light, running out from a vanishing point that drifts as the road curves. Hold the search button (mouse, finger, or Space or Enter on the keyboard) and the streaks pick up speed and stretch; let go and they ease back to a cruise. A quick press gives a short burst. The button still submits the form as usual.

[Live demo](https://motion.rujilabs.com/patterns/warp-tunnel/) · [style.css](style.css) · [warp-tunnel.js](warp-tunnel.js)

## Use

```html
<link rel="stylesheet" href="warp-tunnel/style.css">
<script src="warp-tunnel/warp-tunnel.js" defer></script>

<section class="warp">
  <canvas class="wt-canvas" aria-hidden="true"></canvas>
  <h1>Sleep in KL, wake up in Kota Bharu.</h1>
  <form>
    ...
    <button type="submit" data-wt-hold>Search trips</button>
  </form>
  <button type="button" class="wt-pause" aria-pressed="false" hidden>Pause</button>
</section>
```

Any button inside `.warp` with `data-wt-hold` speeds the streaks while held. Put the headline and the form on dark panels: streaks pass behind everything. The script shows the Pause button only when the streaks can run.

## Options

| Name | What it does | Default |
|---|---|---|
| `data-wt-hold` | Marks the button (or buttons) that speed the streaks while held | none |
| `--wt-sky` | Night sky (6 digit hex) | `#0a1230` |
| `--wt-lamp` | Street lamp streaks, about half of them (6 digit hex) | `#ffb347` |
| `--wt-head` | Headlight streaks (6 digit hex) | `#d2e4ff` |
| `--wt-tail` | Tail light streaks, one in ten (6 digit hex) | `#ff4a3d` |

The run uses a Web Animations clock ("bus warp"), so the gallery timeline and the Pause button (`aria-pressed`) both stop it. The hold button takes pointer capture, so sliding a finger off it does not stick the speed on, and it has no long-press menu on phones.

## Do

- Keep the hold button a real action (search, book). The speed-up is a reward for pressing it, not the point.
- Keep text on panels. Fast streaks behind small text make it hard to read.

## Do not

- Do not start it at full speed. A calm cruise is the resting state; speed is the response.
- Do not put two on one page: each holds a live WebGL context.

## Reduced motion

One still frame is drawn with medium streaks and nothing moves; holding the button changes nothing and the Pause button hides. The form works the same. Without WebGL or script, the canvas keeps a CSS still: faint rays out from the vanishing point.

## How it works

- One full-screen triangle; the fragment shader does all the work in polar coordinates round the vanishing point.
- The circle is cut into 64 lanes. Along a lane the depth is `z = 0.35 / r`: a point at depth `z` on a tunnel wall of radius 1 is seen at radius `1 / z`, so equal steps in depth bunch up toward the centre.
- Depth is cut into cells of length 1. A random byte per lane and cell (from a 64 by 64 texture filled once in JS from a fixed seed) says if the cell holds a streak, where it starts, how long it is and its colour.
- Adding a depth offset makes every streak run outward and grow. The offset is integrated in JS from the clock (`z += speed * dt`), so changing speed never jumps; lanes run at 1 or 2 times the offset, so it can wrap at 64 with no seam.
- Speed eases toward its target in 380 ms when picking up and 900 ms when slowing, and also stretches the streaks and thins them, a cheap motion blur.
- The drawing buffer is at most 1.5 times the CSS size, 1 times if the first 30 frames average over 20 ms. Drawing stops off screen and in a hidden tab, the context is released on `pagehide` and rebuilt after `webglcontextlost`.
