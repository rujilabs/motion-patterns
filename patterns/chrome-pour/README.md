# Chrome pour

Use when: a metal fabrication, stainless or polishing workshop wants a hero where liquid chrome pours and reflects a studio light.

A WebGL fragment shader draws a stream of liquid chrome falling into a pool of it in a dark workshop. Bulges run down the stream, rings spread out across the pool, and both act as mirrors: the stream shows a tall softbox and a strip light behind you, the pool shows the ceiling tubes, the high windows on the far wall, a warm glow from the welding bay and a broken reflection of the stream itself. Move the pointer and the softbox moves with it, so the highlight slides across the stream. When nobody points, the light wanders slowly on its own.

[Live demo](https://motion.rujilabs.com/patterns/chrome-pour/) · [style.css](style.css) · [chrome-pour.js](chrome-pour.js)

## Use

```html
<link rel="stylesheet" href="chrome-pour/style.css">
<script src="chrome-pour/chrome-pour.js" defer></script>

<section class="chromepour">
  <canvas class="cp-canvas" aria-hidden="true"></canvas>
  <div class="card">
    <h1>Stainless cut, bent and TIG welded under one roof.</h1>
    <a href="#quote">Upload a drawing</a>
  </div>
  <button type="button" class="cp-pause" aria-pressed="false" hidden>Pause</button>
</section>
```

The canvas fills the `.chromepour` behind its content. Keep the text on a solid dark card to one side of the stream. The script shows the Pause button only when the chrome can move.

## Options

| Name | What it does | Default |
|---|---|---|
| `--cp-wall` | The workshop wall (6 digit hex) | `#15171a` |
| `--cp-light` | The studio light (6 digit hex) | `#fff4e2` |
| `--cp-warm` | Glow from the welding bay, seen in the pool (6 digit hex) | `#ff7a2e` |
| `--cp-x` | Stream centre, as a share of the width | `.72` |
| `--cp-h` | Far edge of the pool, as a share of the height from the top | `.56` |

The script reads the custom properties on every resize, so a media query can move the stream and the pool on a phone (the demo raises the pool to `.3`). The flow runs on a Web Animations clock ("chrome pour"), so the gallery timeline and the Pause button (`aria-pressed`) both stop it; the light still follows a real pointer while paused. On touch a finger dragged across the hero moves the light, and the hero keeps `touch-action: pan-y`, so the page still scrolls.

## Do

- Keep the wall dark and the light warm white: chrome is only as good as what it reflects.
- Put the stream where the eye can follow it down into the pool, clear of the prices.

## Do not

- Do not tint the chrome gold or copper here: a coloured metal needs a different studio.
- Do not put two on one page: each holds a live WebGL context.

## Reduced motion

One still frame is drawn and nothing moves; the Pause button hides. Without WebGL or script, the canvas keeps a CSS still: a steel bar for the stream and a grey gradient for the pool.

## How it works

- One full-screen triangle; the fragment shader does all the work.
- Chrome is a mirror: every pixel is the studio seen along the reflected view ray. The studio is a function of direction: a floor to ceiling gradient, two ceiling tubes (found where the ray meets the ceiling plane), window panes on the far wall, a warm Gaussian glow, and behind the viewer a tall softbox and a strip light placed by the pointer.
- The stream is a cylinder whose radius ripples with two sines running down it, a little thinner low down where it falls faster. Across it the normal is (u, ny, sqrt(1 - u^2)), with ny from the exact slope of the radius.
- The pool is a flat plane in perspective: depth is 1 over the distance below the far edge. Its height is a damped radial wave from the point of impact plus two travelling waves, and their slopes are written out exactly, so the normal needs no finite differences. Ripples fade toward the far edge, where they would shimmer. Below the foot of the stream the pool mirrors it, shifted sideways by the ripple slope.
- Every phase is a whole number of turns per 6 s loop, worked out in JS, so the loop has no seam and stays precise at `mediump`.
- The drawing buffer is at most 1.5 times the CSS size, 1 times if the first 30 frames average over 20 ms. Drawing stops off screen, in a hidden tab and while paused, the context is released on `pagehide` and rebuilt after `webglcontextlost`.
