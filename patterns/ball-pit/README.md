# Ball pit

Use when: a kids play centre, soft play or party venue wants a hero that begs to be touched, with a pit of glossy play balls that roll aside when a finger or the mouse pushes through them.

Forty play balls in five colours drop into the pit when the page opens, bounce and settle into a heap. Push through them with the mouse, a pen or a finger and they tumble out of the way and roll back. When nobody is touching, an unseen hand sweeps slowly through the pit so the balls keep moving. JS runs the physics; a WebGL fragment shader draws every ball as a lit, glossy sphere with soft shadows.

[Live demo](https://motion.rujilabs.com/patterns/ball-pit/) · [style.css](style.css) · [ball-pit.js](ball-pit.js)

## Use

```html
<link rel="stylesheet" href="ball-pit/style.css">
<script src="ball-pit/ball-pit.js" defer></script>

<section class="ballpit">
  <canvas class="bp-canvas" aria-hidden="true"></canvas>
  <div class="card">
    <h1>Two floors of climbing, sliding and one very deep ball pit.</h1>
    <a href="/party">Book a party room</a>
  </div>
  <button type="button" class="bp-pause" aria-pressed="false" hidden>Pause</button>
</section>
```

The canvas fills the `.ballpit` behind its content and the balls heap up along its bottom edge, so put the text near the top. The script shows the Pause button only when the balls can move.

## Options

| Name | What it does | Default |
|---|---|---|
| `--bp-wall` | The wall behind the pit (6 digit hex) | `#e9f3f0` |
| `--bp-1` to `--bp-5` | The five ball colours | red, yellow, blue, green, orange |
| `--bp-size` | Ball size; the heap is deeper on a narrow box, so shrink it there | `1` |

The custom properties are read again on every resize, so a media query can shrink the balls on a phone (the demo does). The physics steps on a Web Animations clock ("ball pit"), so the gallery timeline and the Pause button (`aria-pressed`) both stop it.

## Do

- Keep the heap away from the text: the balls fill the bottom third or so.
- Use real play ball colours, bright and glossy, on a pale wall.

## Do not

- Do not add more balls for a fuller pit: every pixel loops over all of them. Make them bigger instead.
- Do not put two on one page: each holds a live WebGL context.

## Reduced motion

The balls fall and settle unseen (four seconds of physics in one go), and that one still heap is drawn; nothing moves and the Pause button hides. Without WebGL or script, the canvas keeps a CSS still: a row of flat balls along the bottom.

## How it works

- Physics in JS: circles under gravity in a box, with position-based contact. Overlapping balls are pushed apart and their normal speeds swapped with a bounce of 0.5, four passes per substep and two substeps per frame; the floor and walls bounce less and the floor has friction. The pointer is a moving round paddle: it chases the pointer, shoves balls out of its way and lends them its own speed.
- Ball positions go to the GPU every frame in a 64 by 1 byte texture, 16 bits per coordinate, written into one array made once. Each ball's radius and colour come from its index, in JS and in the shader alike, so nothing else needs sending.
- The shader skips everything above the highest ball. Below it, each pixel loops over the 40 balls, keeps the front-most hit and shades it as a sphere: the normal comes straight from the offset to the centre, then diffuse light, a sharp specular, light bounced up from the balls below, and darkening where other balls crowd it. Soft drop shadows fall on the wall and on the balls behind.
- The drawing buffer is at most 1.5 times the CSS size, 1 times if the first 30 frames average over 20 ms. Drawing stops off screen, in a hidden tab and while paused, the context is released on `pagehide` and rebuilt after `webglcontextlost`.
