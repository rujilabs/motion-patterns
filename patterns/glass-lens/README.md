# Glass lens

Use when: a pharmacy leaflet's small print gets a reading lens that slides over it and magnifies the dose and the warnings, with the pointer, a finger or the arrow keys.

The small print is ordinary HTML text. The script draws the same words into a texture, each one exactly where the browser laid it out, and the canvas over the print shows only the lens: the print outside it is the page's own text, sharp and selectable. Inside, the words swell toward the middle like under a real reading glass, with faint coloured fringes near the dark rim, a crescent of light and a soft shadow on the paper. The lens follows the pointer; on touch it sits just above the finger so the finger does not hide it; with `.gl-move` focused, the arrow keys move it (Shift for bigger steps). When nobody steers it, it drifts slowly over the lines.

[Live demo](https://motion.rujilabs.com/patterns/glass-lens/) · [style.css](style.css) · [glass-lens.js](glass-lens.js)

## Use

```html
<link rel="stylesheet" href="glass-lens/style.css">
<script src="glass-lens/glass-lens.js" defer></script>

<div class="glasslens">
  <div class="gl-print">
    <h2>How to take it</h2>
    <p>Adults: 1 to 2 tablets every 4 to 6 hours. Do not take more than 8 tablets in 24 hours.</p>
  </div>
  <canvas class="gl-canvas" aria-hidden="true"></canvas>
  <div class="gl-move" tabindex="0" role="group" aria-label="Magnifier. Use the arrow keys to move it over the small print." hidden></div>
  <button type="button" class="gl-pause" aria-pressed="false" hidden>Pause</button>
</div>
```

The print can hold any text in any styles (headings, bold, colours): each run is drawn in its own computed font and colour. Keep the paper a solid colour and set it with `--gl-paper`, because the lens shows the paper behind the words. Images, borders and backgrounds inside the print are not copied into the lens. The script shows `.gl-move` and the Pause button only when the lens works, and redraws the words after every resize. The lens rests on the words "8 tablets" in the demo (the daily limit); in your print it rests a third of the way in.

## Options

| Name | What it does | Default |
|---|---|---|
| `--gl-paper` | The paper colour under the print (6 digit hex) | `#ffffff` |
| `--gl-size` | Lens radius (24px to 160px) | `56px` |
| `--gl-mag` | Magnification at the centre (1.2 to 4) | `2.3` |

All three are read on every resize, so a media query can change them (the demo uses a smaller lens on phones). The idle drift runs on a Web Animations clock ("reading lens"), so the gallery timeline and the Pause button (`aria-pressed`) both stop it; the lens still follows a real pointer or the keys while paused. The area keeps `touch-action: pan-y`, so a vertical swipe still scrolls the page.

## Do

- Keep the small print readable without the lens: the lens is a help, not the only way in.
- Put the lens's first resting place on the line that matters most, like the daily limit.

## Do not

- Do not use it on text that changes after load without a resize: the texture would show old words.
- Do not put two on one page: each holds a live WebGL context.

## Reduced motion

The lens does not drift and does not ease: it rests on the daily limit and jumps to wherever the reader points or moves it with the keys. There is no Pause button. Without WebGL or script, the plain leaflet shows with no lens.

## How it works

- One full-screen triangle over the print. A `TreeWalker` visits every text node; each word gets a `Range`, and `getClientRects()` says where the browser put it. The word is drawn at that spot into a 2D canvas up to 3 times the CSS size, in its own computed font, on the baseline found from `fontBoundingBoxAscent`, and the canvas is uploaded as one texture.
- A point at distance `r` from the lens centre (in lens radii) reads the print at `centre + d (1 + 0.5 r^2) / m`: magnified `m` times in the middle and less toward the rim, which is barrel distortion.
- Red reads 1.2 per cent further out and blue 1.2 per cent further in, scaled by `r^2`, so only the rim shows colour, as with a simple lens.
- The rim is a dark ring shaded as a rounded section lit from the top left; the shadow is a soft disc offset down and right. The canvas is transparent outside the lens, so the page's own text shows there.
- The lens position eases toward its target with an exponential follow; the idle path is `sin(3a)` across and `sin(2a)` down over the print.
- The drawing buffer is at most 1.5 times the CSS size, 1 times if the first 30 frames average over 20 ms. Drawing stops off screen, in a hidden tab and once settled while paused, the context is released on `pagehide` and rebuilt after `webglcontextlost`.
