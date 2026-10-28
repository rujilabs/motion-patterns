# Scroll weight

A scroll-driven part that trails the scroll instead of riding it. When every layer moves in perfect lockstep with the wheel, the scene feels like a slide being dragged. Give the heavy parts (a door, a shutter, a hanging sign) a slight lag behind the scroll position and they read as paper or steel with mass.

[Live demo](https://motion.rujilabs.com/patterns/scroll-weight/) · [style.css](style.css) · [scroll-weight.js](scroll-weight.js)

## Use

Write the move as an ordinary keyframe animation from the top of the scene (0%) to its end (100%). Shape the timing inside the keyframes and add `.weight`. The script holds the animation paused and scrubs it along a spring.

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="scroll-weight/style.css">
<script src="play.js"></script>
<script src="scroll-weight/scroll-weight.js"></script>

<section class="scene" data-weight-scene>        <!-- tall, e.g. 260svh -->
  <div class="stage">                             <!-- position: sticky; top: 0; height: 100svh -->
    <span class="shutter weight" data-weight="8"></span>
  </div>
</section>
```

```css
.shutter { animation-name: shutter-down; }
@keyframes shutter-down {
  0%, 15% { translate: 0 -100%; }   /* hold, then come down */
  75%, 100% { translate: 0 0; }
}
```

## Options

| Class or attribute | What it does |
|---|---|
| `.weight` | The part. Its first CSS animation is scrubbed by the scroll, linear, fill both |
| `data-weight` | Spring stiffness in rad/s, default `12`. Higher follows closer. `0` locks it to the scroll |
| `[data-weight-scene]` | The section whose scroll progress drives its parts. Without one, the whole page |

| Feel | `data-weight` | 90% of a wheel step lands after |
|---|---|---|
| Light card, label | `16` to `18` | about 250 ms |
| Paper door | `12` to `15` | about 300 ms |
| Steel shutter, heavy sign | `8` to `10` | about 450 ms |

## Do

- Weigh only the heavy parts. Keep the camera, the text and the fades 1:1 with the scroll: the gap between the two is what reads as mass.
- Give a set of parts different weights (outer doors heavier than inner ones) so they land one after another instead of as one block.
- Keep it slight. A lag past half a second feels like the page is slow, not heavy.

## Do not

- Weigh a progress bar, a clock or anything that reports where you are. A gauge that lags looks broken.
- Add more frames or a heavier smooth-scroll to fix a dragged feel. Smoothness comes from the parts moving at different speeds, not from the frame rate.
- Use a bouncy spring here. The part should arrive and stop; an overshoot on a scroll scrub reads as a glitch.

## Reduced motion

Every part is parked at the end of its move and the script does nothing.
