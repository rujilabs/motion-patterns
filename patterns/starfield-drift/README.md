# Starfield drift

Use when: a planetarium or night-sky show needs a booking hero with a spiral of stars that turns slowly and leans toward the visitor's pointer.

A spiral galaxy, drawn per pixel by a WebGL fragment shader, turns once every four minutes behind the hero. Move the pointer and the disc leans toward it: the near side comes closer and grows, the far side recedes, and a second layer of far stars slides a little the other way. When nobody points, a slow unseen hand leans the disc on the same clock, so the lean shows without a mouse.

[Live demo](https://motion.rujilabs.com/patterns/starfield-drift/) · [style.css](style.css) · [starfield-drift.js](starfield-drift.js)

## Use

```html
<link rel="stylesheet" href="starfield-drift/style.css">
<script src="starfield-drift/starfield-drift.js" defer></script>

<section class="starfield" data-sf-centre="0.7 0.4">
  <canvas class="sf-canvas" aria-hidden="true"></canvas>
  <div class="copy">
    <h1>Langit Khatulistiwa, the night show under a 17 m dome.</h1>
    <a href="#book">Book seats</a>
  </div>
  <button type="button" class="sf-pause" aria-pressed="false" hidden>Pause</button>
</section>
```

The canvas fills the `.starfield` behind its content. Put the text on a dark panel to one side of the galaxy centre. The script shows the Pause button only when the galaxy can turn.

## Options

| Name | What it does | Default |
|---|---|---|
| `data-sf-centre` | Galaxy centre, as shares of the width and height | `0.7 0.42` |
| `--sf-sky` | Night sky (6 digit hex) | `#070b1c` |
| `--sf-star` | Star light (6 digit hex) | `#e8ecff` |
| `--sf-glow` | Dust glow along the arms and round the core (6 digit hex) | `#8a5a3c` |

The turn runs on a Web Animations clock ("galaxy turn"), so the gallery timeline and the Pause button (`aria-pressed`) both stop it, twinkle included; the disc still leans for the real pointer while paused. On touch a finger dragged across the hero leans it, and the hero keeps `touch-action: pan-y`, so the page still scrolls.

## Do

- Keep the galaxy off the text. The show, the date and the price are the content.
- Use it once per page: each one holds a live WebGL context.

## Do not

- Do not raise the colours to full white glow: the stars need a dark sky to read as stars.
- Do not make the hero full screen on a phone without checking the frame rate: the cost grows with the pixel count.

## Reduced motion

One still frame is drawn, the disc leaned a little to the right, and nothing turns or leans; the Pause button hides. Without WebGL or script, the canvas keeps a CSS still of the same sky: a warm core glow and scattered stars.

## How it works

- One full-screen triangle; the fragment shader does all the work.
- Stars sit one per cell of a grid in the turning disc plane. A cell gets a star when a random byte (from a 64 by 64 texture filled once in JS from a fixed seed) beats the density at the cell centre, so stars are never cut by a changing mask.
- The density is a two-armed log spiral, `cos(2 theta - 4.6 ln r)` cubed, times `exp(-2.4 r)`, plus a bright core.
- The lean is a projective skew: each point is divided by `1 + 0.9 m (p . n)`, where `n` is the pointer direction and `m` its distance, then the disc is flattened for the viewing angle and turned.
- Time is passed as an angle from 0 to 2 pi over one turn and only whole multiples of it are used, so the loop has no seam and stays precise at `mediump`.
- The drawing buffer is at most 1.5 times the CSS size, 1 times if the first 30 frames average over 20 ms. Drawing stops off screen and in a hidden tab, the context is released on `pagehide` and rebuilt after `webglcontextlost`.
