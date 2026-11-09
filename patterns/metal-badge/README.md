# Metal badge

Use when: a shop's loyalty card page wants the member badge to feel like a real brushed steel plate, tilting toward the visitor's pointer while a light band rolls across it.

The badge's own HTML (shop name, member number, tier) is read into a 2D canvas, turned into a height map and drawn in WebGL as a brushed steel plate in 3D: raised polished letters, a raised border, four screw heads and a bevelled edge. The plate tilts toward the pointer and a streak of light slides across the brushing as it turns. On touch, drag a finger across it. When nobody points, it sways slowly on its own. The HTML text stays in the page under the canvas for screen readers, and is what shows without WebGL or script.

[Live demo](https://motion.rujilabs.com/patterns/metal-badge/) · [style.css](style.css) · [metal-badge.js](metal-badge.js)

## Use

```html
<link rel="stylesheet" href="metal-badge/style.css">
<script src="metal-badge/metal-badge.js" defer></script>

<div class="metalbadge">
  <div class="mb-plate">
    <p class="mb-shop">Seng Hup Hardware</p>
    <p class="mb-no">0418 2207</p>
    <p class="mb-tier">Gold member since 2019</p>
  </div>
  <canvas class="mb-canvas" aria-hidden="true"></canvas>
  <button type="button" class="mb-pause" aria-pressed="false" hidden>Pause</button>
</div>
```

Give the `.metalbadge` a size; the plate (aspect 1.6) sits in its middle. The three lines are embossed in the plate's font (read from `.mb-no`), upper case if the CSS says so. Keep them short: a line too wide is shrunk to fit. The script shows the Pause button only when the plate can move.

## Options

| Name | What it does | Default |
|---|---|---|
| `--mb-size` | Plate half width, as a share of the area's short side (0.2 to 0.8) | `.55` |
| `--mb-metal` | The steel tint (6 digit hex): try `#d9b98a` for brass | `#c9ccd1` |

Both are read on every resize, so a media query can change them (the demo uses a smaller plate on phones). The sway runs on a Web Animations clock ("brushed metal"), so the gallery timeline and the Pause button (`aria-pressed`) both stop it; the plate still follows a real pointer while paused. The area keeps `touch-action: pan-y`, so a vertical swipe still scrolls the page.

## Do

- Put the same details in plain text next to the badge (the demo lists the member number and points), so nobody has to read embossed letters.
- Keep the background behind it calm: the plate casts a soft shadow onto it.

## Do not

- Do not use it for anything the visitor must scan, like a barcode or QR code: the tilt and the light band get in the way.
- Do not put two on one page: each holds a live WebGL context.

## Reduced motion

The script draws one still frame with the plate turned slightly, the light band across its left side. Nothing moves and there is no Pause button. Without WebGL or script, the HTML plate shows on a still brushed gradient with the same text.

## How it works

- One full-screen triangle. Each pixel casts a ray from a pinhole camera and meets the plate's plane, rotated by a yaw and a pitch worked out in JS. A rounded box distance gives the outline (antialiased by the pixel size on the plate), the bevel and the shadow.
- The text is drawn white on black into a 768 by 480 canvas, blurred twice with a box blur and differentiated once in JS: the slopes go into the red and green of a texture as the letters' normals, so the shader never takes differences itself.
- The brushing is value noise stretched 65 times along the plate, read from a 64 by 64 random texture; it tints the steel and wobbles the normal a little across the grain.
- The light band is a Kajiya-Kay highlight: `pow(sqrt(1 - (T.H)^2), k)` with `T` the brushing direction and `H` the half vector between the light and the eye. It is brightest where the half vector is square to the grain, a streak that slides across the plate as it turns. The letters use an ordinary round highlight instead, so they read as polished.
- The drawing buffer is at most 1.5 times the CSS size, 1 times if the first 30 frames average over 20 ms. Drawing stops off screen, in a hidden tab and once settled while paused, the context is released on `pagehide` and rebuilt after `webglcontextlost`.
