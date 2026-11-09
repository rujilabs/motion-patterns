# Paint swirl

Use when: a board game cafe, toy shop or kids' art studio wants a hero where thick paint in its house colours swirls slowly into a vortex behind the opening card.

A WebGL fragment shader paints five spiral arms of thick colour (cream, meeple red, mustard, teal and navy in the demo) round one centre. The arms wind tighter toward the middle and a domain-warped noise bends their edges, so they look stirred by hand rather than drawn with a compass. Each band has a lit ridge along one edge, a little bristle grain, and the whole surface is printed in chunky square pixels, like a board game box. The pot turns once every 90 seconds: calm, never strobing.

[Live demo](https://motion.rujilabs.com/patterns/paint-swirl/) · [style.css](style.css) · [paint-swirl.js](paint-swirl.js)

## Use

```html
<link rel="stylesheet" href="paint-swirl/style.css">
<script src="paint-swirl/paint-swirl.js" defer></script>

<section class="paintswirl" data-ps-pixel="4">
  <canvas class="ps-canvas" aria-hidden="true"></canvas>
  <div class="card">
    <h1>312 games on the shelf and a game guru at every table.</h1>
    <p>Open daily 11:30 am to 12:30 am</p>
    <a href="/book">Book a table for tonight</a>
  </div>
  <button type="button" class="ps-pause" aria-pressed="false" hidden>Pause</button>
</section>
```

The canvas fills the `.paintswirl` behind its content. Put the text on a solid card: paint bands run light and dark, and no text colour reads on all of them. The script shows the Pause button only when the paint can move.

## Options

| Name | What it does | Default |
|---|---|---|
| `data-ps-pixel` | Size of a paint pixel, in CSS px (2 to 12) | `4` |
| `--ps-c0` to `--ps-c4` | The five paints, in order round the spiral (6 digit hex) | `#f3e6cc` `#d6452f` `#e9b42c` `#1f7a78` `#22305a` |
| `--ps-at` | The centre of the vortex, as shares of the width and height | `.68 .5` |

The script reads the custom properties on every resize, so a media query can move the vortex on a phone (the demo moves it up to `.5 .2`, above the card). The paint runs on a Web Animations clock ("paint swirl"), so the gallery timeline and the Pause button (`aria-pressed`) both stop it.

## Do

- Pick paints with real contrast between neighbours, or the arms melt into one blur.
- Set the vortex centre where the card is not, so the eye lands on the swirl and then the words.

## Do not

- Do not speed it up: a fast vortex is a hypnosis wheel, and it pulls the reader away from the text.
- Do not set text straight on the paint.
- Do not put two on one page: each holds a live WebGL context.

## Reduced motion

One still frame of the vortex is drawn and nothing moves; the Pause button hides. Without WebGL or script, the canvas keeps a CSS still: the same five paints as a pinwheel round the same centre.

## How it works

- One full-screen triangle; the fragment shader works per paint pixel (`floor` of the pixel position to the pixel grid), so every pixel in a square gets one colour.
- Value noise comes from a 64 by 64 random texture with LINEAR filtering, read at smoothstepped coordinates, so the hardware does the blend. Three octaves make an fbm, and a two step domain warp feeds the noise its own output: `v = fbm(p + 1.2 q)`, with `q` two more fbm reads.
- The plane is turned by `a + 2.0 / (r + 0.4)` before the noise is read: an angle that grows toward the centre, so inner paint is wound further than outer paint.
- The bands are `t = 8 r + 5 theta / 2 pi + 3.2 (v - 0.5)`: five spiral arms per turn (so the colour matches across the jump in `atan`), bent by the warped noise. `floor(t)` picks the paint, `fract(t)` lights a ridge along one edge and shades the other.
- Time is an angle 0 to 2 pi per loop: the vortex turns one whole turn and the noise moves once round a circle, so the loop has no seam.
- The drawing buffer is at most 1.5 times the CSS size, 1 times if the first 30 frames average over 20 ms. Drawing stops off screen, in a hidden tab and while paused, the context is released on `pagehide` and rebuilt after `webglcontextlost`.
