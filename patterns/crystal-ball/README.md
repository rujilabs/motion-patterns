# Crystal ball

Use when: a jeweller's hero shows the ring display behind the counter, and a glass ball resting on the counter rolls toward the visitor's pointer, showing the rings through it refracted and upside down.

The display photo is read into WebGL once and redrawn with a glass ball resting on the counter. The ball rolls toward the pointer with a heavy, slightly springy lag; on touch, drag a finger across. When nobody points, it rolls slowly to and fro on its own. Through it the display shows upside down and smaller, as through a real lens ball, with faint coloured fringes near the rim, a reflected window, a small highlight, a soft shadow and the bright spot of light the glass focuses onto the counter. The ring names and prices stay as HTML below the photo, and the real `<img>` (with its alt text) stays in the page under the canvas.

The demo photo is an SVG drawn for this entry, [display.svg](display.svg): five numbered ring stands on a walnut counter.

[Live demo](https://motion.rujilabs.com/patterns/crystal-ball/) · [style.css](style.css) · [crystal-ball.js](crystal-ball.js)

## Use

```html
<link rel="stylesheet" href="crystal-ball/style.css">
<script src="crystal-ball/crystal-ball.js" defer></script>

<div class="crystalball">
  <img class="cb-photo" src="display.jpg" alt="Five rings on velvet stands" width="1600" height="1200">
  <div class="cb-still" aria-hidden="true"></div>
  <canvas class="cb-canvas" aria-hidden="true"></canvas>
  <button type="button" class="cb-pause" aria-pressed="false" hidden>Pause</button>
</div>
```

Give the `.crystalball` a size (the photo is cropped to it like `object-fit: cover`, centred). Set `--cb-floor` to the height in the photo where the ball should touch the counter. The image must be served from the same origin as the page, or WebGL cannot read it and the photo stays with the still CSS ball. The script shows the Pause button only when the ball can move.

## Options

| Name | What it does | Default |
|---|---|---|
| `--cb-size` | Ball radius, as a share of the area's short side (0.08 to 0.4) | `.2` |
| `--cb-floor` | Where the ball touches the counter: height in the photo from its bottom edge, 0 to 1 | `.29` |

Both are read on every resize, so a media query can change them (the demo uses a smaller ball on phones). The idle roll runs on a Web Animations clock ("crystal ball"), so the gallery timeline and the Pause button (`aria-pressed`) both stop it; the ball still follows a real pointer while paused. The area keeps `touch-action: pan-y`, so a vertical swipe still scrolls the page.

## Do

- Use a photo with a clear horizon (a counter, a shelf, a table) so the ball has something to rest on.
- Keep the prices and names in HTML next to the photo, numbered to match the display.

## Do not

- Do not put text over the photo where the ball rolls: the ball would hide or flip it.
- Do not put two on one page: each holds a live WebGL context.

## Reduced motion

The script draws one still frame with the ball resting on the right of the counter. Nothing moves and there is no Pause button. Without WebGL or script, the plain photo shows with a still ball drawn in CSS (`.cb-still`).

## How it works

- One full-screen triangle; the fragment shader reads the photo as a texture, cropped like `object-fit: cover`.
- Each pixel inside the ball is a ray along the view axis. It bends into the sphere at the front with Snell's law (GLSL `refract`, index 1.5), crosses the chord to the back surface (on a unit sphere the exit point is `p1 - 2 (p1 . t) t`), bends out again, and travels on to the display plane four radii behind, where the photo is read. A full ball works as a strong lens, so the display comes out flipped and smaller. A ray that cannot leave (total internal reflection) is reflected instead.
- Red, green and blue go through with indices 1.475, 1.5 and 1.525, which gives the coloured fringes near the rim.
- Schlick's Fresnel term `0.04 + 0.96 (1 - cos)^5` mixes in a reflected room (bright above, dark below) and a window with a cross bar, so the rim brightens and the window shows top left.
- The shadow and the focused light on the counter are two flattened Gaussians beside the contact point.
- The ball's position is a damped spring in JS (stiffness 14, damping 5.2), so it rolls after the pointer and settles with a little overshoot.
- The drawing buffer is at most 1.5 times the CSS size, 1 times if the first 30 frames average over 20 ms. Drawing stops off screen, in a hidden tab and once settled while paused, the context is released on `pagehide` and rebuilt after `webglcontextlost`.
