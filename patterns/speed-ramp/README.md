# Speed ramp

An action speeds up, slows to a crawl at the key moment, then speeds up again, as when an editor ramps the speed of a clip around a jump or a hit. One keyframe curve drives a clock, `--ramp-t`, and every moving part reads that clock, so they all slow down and speed up together.

[Live demo](https://motion.rujilabs.com/patterns/speed-ramp/) · [style.css](style.css)

## Use

Put `.ramp` on the frame. Inside it, write each movement in terms of `var(--ramp-t)`, which runs from 0 to 1:

```html
<section class="ramp-group">
  <label class="ramp-pause"><input type="checkbox"> Pause</label>
  <div class="ramp">
    <span class="rider ramp-x"></span>
  </div>
</section>
```

```css
.ramp { position: relative; }
.rider {
  --ramp-from: -10%;
  --ramp-to: 100%;
  /* a jump: lift is above zero only while t is between .32 and .68 */
  --lift: max(0, 1 - ((var(--ramp-t) - .5) / .18) * ((var(--ramp-t) - .5) / .18));
  transform: translateY(calc(var(--lift) * -70%));
}
```

## Options

| Class or property | What it does |
|---|---|
| `.ramp` | Runs the clock: `--ramp-t` from 0 to 1 over `--ramp-dur`, on the ramp curve, looping |
| `--ramp-dur` | Length of one pass. Default `5s` |
| `.ramp-x` | Helper: moves the element across its positioned parent, from `--ramp-from` (default `0%`) to `--ramp-to` (default `100%`) |
| `.ramp-pause` inside `.ramp-group` | A checkbox that pauses everything in the group |

The curve is `t = u + .9 * sin(2 pi u) / (2 pi)`, written as 21 keyframes: the speed is 1.9 times normal at both ends and a tenth of normal at the middle. Put the key moment of your action at `--ramp-t: .5`.

## Do

- Ramp one clear moment per pass: the top of a jump, a ball meeting a bat, a product turning to face the camera.
- Drive every part from `--ramp-t`, including turns and shadows. One part on its own clock breaks the effect.

## Do not

- Use `animation-delay` on parts inside the ramp: a delay is real time, not ramp time.
- Make the crawl too long. At a tenth of the speed, 30% of the pass is already a long hold.

## Browser support

`--ramp-t` is registered with `@property` so it can be animated. Browsers without `@property` jump from start to end in one step instead of moving smoothly.

## Reduced motion

The clock stops at `--ramp-t: .5`, so the scene shows the key moment as a still frame. The pause toggle hides.
