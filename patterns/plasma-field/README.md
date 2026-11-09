# Plasma field

Use when: an esports cafe, LAN centre or arcade wants a slow glow in its house colours behind the opening hours, like the LED wall behind the counter.

A WebGL fragment shader draws the classic plasma, a slow sum of sines in two house colours, and shows it as an LED wall: round dots on a dark board, each lit by the plasma at its centre, over a faint glow of the same plasma. It drifts once round its loop every two minutes, slow enough to sit behind a table of hours without pulling the eye off it.

[Live demo](https://motion.rujilabs.com/patterns/plasma-field/) · [style.css](style.css) · [plasma-field.js](plasma-field.js)

## Use

```html
<link rel="stylesheet" href="plasma-field/style.css">
<script src="plasma-field/plasma-field.js" defer></script>

<section class="plasma" data-pf-pitch="7">
  <canvas class="pf-canvas" aria-hidden="true"></canvas>
  <div class="card">
    <h1>48 rigs, 240 Hz, open till 4:00 am on weekends.</h1>
    <table>...opening hours...</table>
  </div>
  <button type="button" class="pf-pause" aria-pressed="false" hidden>Pause</button>
</section>
```

The canvas fills the `.plasma` behind its content. Put the hours on a dark card: the wall is bright. The script shows the Pause button only when the plasma can move.

## Options

| Name | What it does | Default |
|---|---|---|
| `data-pf-pitch` | Space between LED dots, in CSS px (4 or more) | `7` |
| `--pf-base` | The dark board (6 digit hex) | `#0b100c` |
| `--pf-a` | House colour one (6 digit hex) | `#b6ff3b` |
| `--pf-b` | House colour two (6 digit hex) | `#ff5a2a` |

The glow runs on a Web Animations clock ("plasma glow"), so the gallery timeline and the Pause button (`aria-pressed`) both stop it, and the loop stops drawing while paused.

## Do

- Use your two real house colours. Two strong colours on a near-black board read as a venue; a rainbow reads as a screensaver.
- Keep the content on a solid card with plenty of contrast.

## Do not

- Do not speed it up. Fast plasma behind text is tiring and hard to read through.
- Do not put two on one page: each holds a live WebGL context.

## Reduced motion

One still frame of the wall is drawn and nothing moves; the Pause button hides. Without WebGL or script, the canvas keeps a CSS still: two soft glows in the house colours behind a grid of dots.

## How it works

- One full-screen triangle; the fragment shader does all the work.
- The plasma is four sines added: a horizontal wave, a wave whose direction turns, and two rings round centres that wander on Lissajous paths. Every time term is a whole multiple of one angle that runs 0 to 2 pi over the loop, so it has no seam and stays precise at `mediump`.
- The value goes through two sines half a turn apart, each cut with a smoothstep, to light house colour one, house colour two, or neither.
- The LED wall samples once per dot: the pixel is floored to the dot grid, the plasma is read at the dot centre, and a smoothstep on the distance from the centre cuts a round dot. A second read at the pixel itself, at a fifth of the strength, gives the glow between dots.
- The drawing buffer is at most 1.5 times the CSS size, 1 times if the first 30 frames average over 20 ms; the dot pitch scales with it. Drawing stops off screen, in a hidden tab and while paused, the context is released on `pagehide` and rebuilt after `webglcontextlost`.
