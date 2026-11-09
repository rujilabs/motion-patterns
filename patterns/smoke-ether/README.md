# Smoke ether

Use when: a day spa, massage house or wellness studio wants its hero to feel like a dim treatment room, with soft coloured smoke drifting up behind the menu and parting round a passing hand.

A WebGL fragment shader draws peach and eucalyptus smoke rising through a dark room. It flows along curl noise, so it curls and stretches like real smoke, and it bends round the pointer (mouse, pen or a finger) the way smoke parts round a hand. When nobody is pointing, an unseen hand drifts slowly through it. It is analytic, not a simulation: nothing is kept between frames, so it is cheap and loops with no seam every 90 seconds.

[Live demo](https://motion.rujilabs.com/patterns/smoke-ether/) · [style.css](style.css) · [smoke-ether.js](smoke-ether.js)

## Use

```html
<link rel="stylesheet" href="smoke-ether/style.css">
<script src="smoke-ether/smoke-ether.js" defer></script>

<section class="ether">
  <canvas class="sx-canvas" aria-hidden="true"></canvas>
  <div class="card">
    <h1>Ninety slow minutes. Warm stones, pandan oil, no phones.</h1>
    <ul>...treatments and prices...</ul>
  </div>
  <button type="button" class="sx-pause" aria-pressed="false" hidden>Pause</button>
</section>
```

The canvas fills the `.ether` behind its content. Put the menu on a dark card. The script shows the Pause button only when the smoke can move.

## Options

| Name | What it does | Default |
|---|---|---|
| `--sx-base` | The dark room (6 digit hex) | `#211a1d` |
| `--sx-a` | Smoke colour one | `#f4c3a8` |
| `--sx-b` | Smoke colour two | `#a8cdbf` |
| `--sx-reach` | How wide the smoke parts round the pointer, in heights | `.12` |
| `--sx-idle-x` | Where the idle hand drifts, as a share of the width from the middle | `.25` |

The custom properties are read again on every resize, so a media query can change them (the demo moves the idle hand to the middle on a phone). The smoke runs on a Web Animations clock ("smoke drift"), so the gallery timeline and the Pause button (`aria-pressed`) both stop it.

## Do

- Use two soft colours that belong to the room: oil, linen, clay, leaves. Pastels on a dark warm base read as candlelight.
- Keep the menu on a solid card; smoke behind small text is hard to read through.

## Do not

- Do not use bright saturated colours: it turns from smoke into a lava lamp.
- Do not put two on one page: each holds a live WebGL context.

## Reduced motion

One still frame is drawn, with the hand resting in the smoke, and nothing moves; the Pause button hides. Without WebGL or script, the canvas keeps a CSS still: two soft plumes over the dark base.

## How it works

- A stream function `psi = (value noise + an upward drift) x gate`, where the gate is a smoothstep of the distance to the pointer, zero close to it. Its curl `(d psi / dy, -d psi / dx)` is a velocity field with no divergence that flows round the pointer like water round a stone.
- The value noise returns its gradient analytically from its four corner values and the smoothstep's derivative (no finite differences, so it is clean at `mediump`); the gate's gradient is analytic too. The speed is capped so a trace step never jumps across the hand.
- Each pixel is traced back four short steps along the field, and the smoke density is read where it came from: three octaves of value noise for a soft body, plus a ridge where the noise crosses its middle for wisps. More smoke sits low in the room, thinning as it rises, and it thins where the hand is.
- The density noise tiles every 16 cells and scrolls one whole tile upward per loop; the flow noise moves once round a circle per loop. So the loop has no seam and every coordinate stays small and precise at `mediump`.
- The drawing buffer is at most 1.5 times the CSS size, 1 times if the first 30 frames average over 20 ms. Drawing stops off screen, in a hidden tab and while paused, the context is released on `pagehide` and rebuilt after `webglcontextlost`.
