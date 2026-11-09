# Stage beams

Use when: a concert or gig ticket page wants moving spotlight beams sweeping through stage haze behind the date, prices and Buy button.

A WebGL fragment shader draws spotlight beams hung from a truss above the frame. Each beam swings on its own slow sweep, lights the drifting haze it passes through, pools on the stage floor and catches the heads of a crowd in silhouette along the bottom. One full sweep cycle takes 48 seconds, so the beams cross and part without ever flashing.

[Live demo](https://motion.rujilabs.com/patterns/stage-beams/) · [style.css](style.css) · [stage-beams.js](stage-beams.js)

## Use

```html
<link rel="stylesheet" href="stage-beams/style.css">
<script src="stage-beams/stage-beams.js" defer></script>

<section class="beams" data-sb-beams="4">
  <canvas class="sb-canvas" aria-hidden="true"></canvas>
  <div class="ticket">
    <h1>Kugiran Hujan Petang, live: the Lampu Jalan tour</h1>
    <p>Saturday 21 November 2026, doors 7:45 pm</p>
    <a href="/tickets">Buy tickets</a>
  </div>
  <button type="button" class="sb-pause" aria-pressed="false" hidden>Pause</button>
</section>
```

The canvas fills the `.beams` behind its content. Put the ticket details on a dark card: the beams are bright where they cross. The script shows the Pause button only when the beams can move.

## Options

| Name | What it does | Default |
|---|---|---|
| `data-sb-beams` | Number of beams on the truss, 2 to 6 | `4` |
| `--sb-base` | The dark hall (6 digit hex) | `#130b10` |
| `--sb-a` | Beam colour one, odd beams (6 digit hex) | `#ffb347` |
| `--sb-b` | Beam colour two, even beams (6 digit hex) | `#ff4f6d` |

The sweep runs on a Web Animations clock ("beam sweep"), so the gallery timeline and the Pause button (`aria-pressed`) both stop it, and the loop stops drawing while paused.

## Do

- Use the two colours of the tour poster. Two warm gels read as a real rig; a rainbow reads as a disco.
- Keep the card solid and dark so the date and prices stay readable when a beam crosses behind them.

## Do not

- Do not speed the sweep up or add strobing. Fast moving light behind text is tiring, and flashing can trigger seizures.
- Do not put two on one page: each holds a live WebGL context.

## Reduced motion

One still frame is drawn with the beams fanned across the stage, and nothing moves; the Pause button hides. Without WebGL or script, the canvas keeps a CSS still: four beams fanned down from the top in the two colours.

## How it works

- One full-screen triangle; the fragment shader does all the work.
- Each beam is a ray from its fixture. Its angle is a sum of a fixed lean and a sine of a whole multiple of one clock angle that runs 0 to 2 pi over the loop, so the sweep has no seam and stays precise at `mediump`.
- For each pixel, the distance along the ray and across it give a Gaussian cone that widens with distance and fades with the inverse square. Where the ray meets the floor, a flat Gaussian ellipse makes the pool of light.
- The haze is two octaves of value noise read from a 64 x 64 random texture with linear filtering on smoothstepped coordinates. The noise offsets go round circles in noise space, so the haze drifts and loops cleanly. The beams are multiplied by it, which is what makes them look like light in smoke.
- The crowd is one head (a circle) and shoulders per grid cell, with a few raised hands, all sized from the same random texture, and lit with a thin rim from the beams.
- The drawing buffer is at most 1.5 times the CSS size, 1 times if the first 30 frames average over 20 ms. Drawing stops off screen, in a hidden tab and while paused, the context is released on `pagehide` and rebuilt after `webglcontextlost`.
