# God rays

Use when: a tea estate, hill resort or highland farm wants a morning hero where shafts of light fall through drifting mist from behind the hill.

A WebGL fragment shader paints a valley at sunrise: the sun just behind a tree-lined ridge, two nearer hills of tea rows, and mist lying in the folds between them. Light comes through every gap between the tree crowns as a shaft, brightest where it crosses the mist. The mist drifts on a 90 second loop and the shafts thicken and thin as it passes the ridge.

[Live demo](https://motion.rujilabs.com/patterns/god-rays/) · [style.css](style.css) · [god-rays.js](god-rays.js)

## Use

```html
<link rel="stylesheet" href="god-rays/style.css">
<script src="god-rays/god-rays.js" defer></script>

<section class="godrays">
  <canvas class="gr-canvas" aria-hidden="true"></canvas>
  <div class="card">
    <h1>Walk the tea rows while the mist lifts.</h1>
    <p>Sunrise walk, daily from 6:50 am. Adult RM 42.90.</p>
    <a href="/book">Book a sunrise walk</a>
  </div>
  <button type="button" class="gr-pause" aria-pressed="false" hidden>Pause</button>
</section>
```

The canvas fills the `.godrays` behind its content. Put the copy on a light card away from the sun: the sky round it is bright. The script shows the Pause button only when the mist can move.

## Options

| Name | What it does | Default |
|---|---|---|
| `--gr-sun-at` | Where the sun sits, `x y` as fractions of the box from the top left (y 0.1 to 0.6). Read on every resize, so a media query can move it | `0.72 0.36` |
| `--gr-sky` | Morning sky near the sun (6 digit hex) | `#f3e3c3` |
| `--gr-sun` | Sunlight (6 digit hex) | `#ffc861` |
| `--gr-hill` | Tea bush green (6 digit hex) | `#23412f` |
| `--gr-mist` | Valley mist (6 digit hex) | `#eef1ea` |

The hills are built round the sun, so moving it moves the whole valley. On a tall box the scene is scaled to three quarters of the width, so the trees keep their size on a phone. The mist runs on a Web Animations clock ("mist drift"), so the gallery timeline and the Pause button (`aria-pressed`) both stop it, and the loop stops drawing while paused.

## Do

- Put the sun on the side away from the copy, and move it up on a phone (the demo uses `0.64 0.17`) so the valley shows above a card at the bottom.
- Keep the light warm and low. Morning light is what sells a sunrise walk.

## Do not

- Do not put white text straight on the scene. The sky and mist are pale.
- Do not put two on one page: each holds a live WebGL context.

## Reduced motion

One still frame of the valley is drawn, shafts and all, and nothing moves; the Pause button hides. Without WebGL or script, the canvas keeps a CSS still: a sun glow with soft rays over three hills.

## How it works

- One full-screen triangle; the fragment shader does all the work.
- The hills are sums of sines, the far ridge with a Gaussian bump under the sun. The trees on the ridge are one crown (a half ellipse) per grid cell, a quarter of the cells left empty, sized from a 64 x 64 random texture.
- The shafts are angular. From the sun toward each pixel, 8 samples just past the sun ask "is this point open sky?" and "how thick is the mist here?". Their average is how much of the sun gets through along that angle, so every gap between two crowns throws a shaft down the valley. It is multiplied by the mist at the pixel, so the light shows where there is something to catch it.
- The mist is value noise read from the random texture with linear filtering on smoothstepped coordinates. Its offsets go round circles in noise space, a whole number of times per loop, so it drifts with no seam and stays precise at `mediump`.
- The drawing buffer is at most 1.5 times the CSS size, 1 times if the first 30 frames average over 20 ms. Drawing stops off screen, in a hidden tab and while paused, the context is released on `pagehide` and rebuilt after `webglcontextlost`.
