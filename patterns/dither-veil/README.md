# Dither veil

Use when: a portrait or wedding studio wants its sample portrait to develop out of a grainy dithered veil as the visitor scrolls it into view, like a print coming up in the tray.

The photo is read into WebGL once and drawn over itself under a veil: a one bit print of the same photo in two inks (plum and cream in the demo), made of random grains, so the face just reads through it. As the photo scrolls into view the veil dissolves grain by grain, starting at the face and running out to the corners, through a band of coarse colour grains, to the full photo. Scroll back up and the veil comes back. Nothing moves while the page is still. The real `<img>` (with its alt text) stays in the page under the canvas.

It is not [dither wave](../dither-wave/): that one is an ordered 4 by 4 Bayer dither of a moving gradient on a loop. Here the grains are random (stochastic screening, no grid pattern), the subject is a photo, and scroll is the only clock.

The demo photo is an SVG drawn for this entry, [portrait.svg](portrait.svg): a graduate in a tudung, gown and mortarboard.

[Live demo](https://motion.rujilabs.com/patterns/dither-veil/) · [style.css](style.css) · [dither-veil.js](dither-veil.js)

## Use

```html
<link rel="stylesheet" href="dither-veil/style.css">
<script src="dither-veil/dither-veil.js" defer></script>

<figure class="ditherveil" data-dv-pixel="3" data-dv-focus=".5 .4">
  <img class="dv-photo" src="graduate.jpg" alt="Portrait of a smiling graduate in a mortarboard" width="1200" height="1500">
  <canvas class="dv-canvas" aria-hidden="true"></canvas>
</figure>
```

Give the `.ditherveil` a size (the photo is cropped to it like `object-fit: cover`, centred). The image must be served from the same origin as the page: WebGL cannot read a photo from another site, and then the plain photo simply stays.

## Options

| Name | What it does | Default |
|---|---|---|
| `data-dv-pixel` | Grain size, in CSS px (1 to 8) | `3` |
| `data-dv-focus` | Where the veil starts to dissolve, as shares of the width and height (put it on the face) | `.5 .42` |
| `--dv-ink` | The veil's dark ink (6 digit hex) | `#3b1f3a` |
| `--dv-paper` | The veil's paper (6 digit hex) | `#f2e8dc` |

The veil is fully on while the photo's top is more than 68 % down the viewport and fully gone once its middle reaches 45 %. The progress also scrubs a paused Web Animations timer ("dither veil"), so the gallery timeline shows where it is. There is no loop, so there is no Pause button.

## Do

- Put the focus on the face, so the eyes come through first.
- Use it once, on the photo the page is selling.

## Do not

- Do not use it on a photo the visitor needs to see straight away, such as a product they came to buy: the veil hides it until they scroll.
- Do not set the grain above 4 px on a small photo: the face stops reading through the veil.
- Do not put two on one page: each holds a live WebGL context.

## Reduced motion

The script does not start: the plain photo shows in full, the finished state. Without WebGL or script, and if the photo cannot be read, the plain photo shows too.

## How it works

- One full-screen triangle; the fragment shader works per grain (`floor` of the pixel position to the grain size).
- Each grain gets two random numbers from a 64 by 64 random texture read with NEAREST filtering. The first is its print threshold: the grain prints paper where the photo's luminance (stretched so the face reads) is above it, ink below. That is white noise dither, or stochastic (FM) screening: no grid, no pattern.
- The second number says when the grain dissolves. The front is `f = 2.5 p - 1.2 d`, with `p` the scroll progress and `d` the distance from the focus over the distance to the farthest corner, so at `p = 1` every grain has gone. A grain shows the photo when its number is below `f - 0.22`, a coarse colour grain (each channel dithered to 3 levels with the same threshold) when below `f`, and the veil otherwise.
- The progress comes from the box's place in the viewport on every scroll, one `requestAnimationFrame` per frame, only while the box is near the screen.
- The photo is drawn once into a 2D canvas at up to twice its size (crisp for an SVG) and uploaded as one texture.
- The drawing buffer is at most 1.5 times the CSS size, 1 times if 30 back to back scroll frames average over 20 ms. The context is released on `pagehide` and rebuilt after `webglcontextlost`.
