# Long exposure

Moving lights leave smooth streaks while everything that stands still stays sharp. Each streak grows along its path at a steady speed while the shutter is open, holds, then fades for the next exposure.

[Live demo](https://motion.rujilabs.com/patterns/long-exposure/) · [style.css](style.css)

## Use

Draw the still scene as usual. Each moving light is a path with `pathLength="1"`; a faint wide copy under it gives the glow.

```html
<section class="exposure-group">
  <label class="exposure-pause"><input type="checkbox"> Pause</label>
  <svg viewBox="0 0 320 200" role="img" aria-label="Traffic at night">
    <!-- buildings, road, lamps: they never move -->
    <g stroke="#ff5a48">
      <path class="exposure-streak exposure-glow" pathLength="1" d="M-10 194 C90 166 200 140 330 124"/>
      <path class="exposure-streak" pathLength="1" stroke-width="1.4" d="M-10 194 C90 166 200 140 330 124"/>
    </g>
  </svg>
</section>
```

## Options

| Class or property | What it does |
|---|---|
| `.exposure-streak` | A light trail: grows along the path, holds, fades. Needs `pathLength="1"` |
| `.exposure-glow` | The wide, faint halo under a trail. Width from `--exposure-glow` (default `6px`) |
| `--exposure-dur` | One exposure. Default `8s` |
| `--exposure-delay` | When this trail starts, so lights do not all leave together. Default `0s` |
| `.exposure-pause` inside `.exposure-group` | A checkbox that pauses everything in the group |

## Do

- Draw each path in the direction the light travels: headlights come toward the camera, tail lights go away.
- Keep several trails in one lane slightly apart. Real long exposures stack a few cars per lane, never one perfect line.

## Do not

- Let still things move. The whole look is the contrast between sharp buildings and flowing light.
- Use bright colours beyond what lights really are: white, amber and red cover most streets.

## Reduced motion

The finished photograph: every streak is complete and nothing moves. The pause toggle hides.
