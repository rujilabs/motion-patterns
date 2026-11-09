# Storm bolt

Use when: a weather app or alert card needs forked lightning flickering inside a storm cloud above a thunderstorm warning.

A WebGL fragment shader draws a dark storm cloud drifting over slanting rain. Every few seconds a forked bolt strikes: a jagged main stroke with two forks, two short pulses of light, then a faint afterglow that fades over about a second, while the cloud round the top of the bolt and the rain nearby light up a little. Each strike draws a different bolt, from twelve seeded shapes.

It is built to stay inside the WCAG 2.3.1 flash limits: strikes are at least 3.6 s apart and each is two pulses, so there are never three flashes in a second; the bolt is a thin line and the cloud glow small and dim, so the area that changes brightness stays small.

[Live demo](https://motion.rujilabs.com/patterns/storm-bolt/) · [style.css](style.css) · [storm-bolt.js](storm-bolt.js)

## Use

```html
<link rel="stylesheet" href="storm-bolt/style.css">
<script src="storm-bolt/storm-bolt.js" defer></script>

<div class="storm" data-sb-strikes="3">
  <canvas class="sb-canvas" aria-hidden="true"></canvas>
  <div class="head">
    <p>Orange alert</p>
    <h1>Thunderstorm warning, Klang Valley</h1>
  </div>
  <button type="button" class="sb-pause" aria-pressed="false" hidden>Pause</button>
</div>
```

The canvas fills the `.storm` behind its content. Put the warning on a dark panel. The script shows the Pause button only when the storm can move.

## Options

| Name | What it does | Default |
|---|---|---|
| `data-sb-strikes` | Strikes per 12 s loop, 1 to 3 (always at least 3.6 s apart) | `3` |
| `--sb-sky` | Storm cloud (6 digit hex) | `#1a232b` |
| `--sb-glow` | Light in the cloud and on the rain (6 digit hex) | `#8fa4b8` |
| `--sb-bolt` | The lightning (6 digit hex) | `#eef2ff` |

The storm runs on a Web Animations clock ("storm"), so the gallery timeline and the Pause button (`aria-pressed`) both stop it, strikes included.

## Do

- Keep it for real warnings. A bolt on a sunny forecast card is noise.
- Keep the strike rate low. One to three strikes in 12 seconds already reads as a storm.

## Do not

- Do not raise the glow or make the bolt wide to make it "pop": a bigger, brighter flash area is what the flash limits are about.
- Do not shorten the gap between strikes or add pulses.
- Do not put two on one page: each holds a live WebGL context.

## Reduced motion

One still frame is drawn with a dim bolt and no flicker, and nothing moves; the Pause button hides. Without WebGL or script, the canvas keeps a CSS still: the storm sky with faint rain lines, a soft glow and a fixed forked bolt drawn as an inline SVG.

## How it works

- One full-screen triangle; the fragment shader does all the work.
- Each channel of the bolt (the main stroke and two forks) is a zigzag x(s), with s the distance down the channel: two octaves of random values from a 64 x 64 texture joined by straight lines. The slope of each piece is known exactly, so the distance to the stroke is the horizontal gap divided by the square root of one plus the slope squared (the slope is capped so flat pieces do not smear). A Gaussian of that distance is the core, two exponentials the halo.
- JS reads the same random bytes to find where on the main stroke each fork starts, and lays out a bolt from a seed: where it starts, how far it reaches, how it leans.
- The strike is two exponential pulses 170 ms apart, the second weaker, plus a slow afterglow on the bolt only.
- The cloud is three octaves of value noise (linear texture reads on smoothstepped coordinates) whose offset runs round a circle, so the 12 s loop has no seam. Rain is one streak in some cells of a slanted grid; the grid slides down by whole cells and a fraction, both worked out in JS, so it stays precise at `mediump`.
- The drawing buffer is at most 1.5 times the CSS size, 1 times if the first 30 frames average over 20 ms. Drawing stops off screen, in a hidden tab and while paused, the context is released on `pagehide` and rebuilt after `webglcontextlost`.
