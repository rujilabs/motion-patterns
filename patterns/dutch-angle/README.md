# Dutch angle

The frame rolls to a canted angle, holds, then levels again. A tilted horizon reads as unease, so the move signals that something is off. The layer scales up while it turns, so the corners of the frame never show what is behind it.

[Live demo](https://motion.rujilabs.com/patterns/dutch-angle/) · [style.css](style.css)

## Use

```html
<section class="dutch-group">
  <label class="dutch-pause"><input type="checkbox"> Pause</label>
  <div class="dutch-frame">
    <img class="dutch" src="lane.png" alt="A back lane at night">
  </div>
</section>
```

## Variants

| Class or property | What it does |
|---|---|
| `.dutch` | Loops: level, roll to the cant, hold, roll back. 6s a round |
| `.dutch-in` | Rolls once and stays canted when `play.js` adds `.go` to it or an ancestor |
| `.dutch-hover` | Level at rest; cants while the frame is hovered or holds focus |
| `--dutch-angle` | The cant. Default `-10deg` (counterclockwise) |
| `--dutch-scale` | How far the layer grows to cover the corners. Default `1.28`, right for 10 degrees in a 16:10 frame |
| `--dutch-dur` | Length of one loop of `.dutch`. Default `6s` |
| `.dutch-pause` inside `.dutch-group` | A checkbox that pauses everything in the group |

For another angle or frame shape, the scale that just covers the frame is `cos(angle) + (width / height) * sin(angle)`. For 6 degrees in a 16:10 frame that is about 1.17.

## Do

- Use it at the turn of a story: a warning, a twist, a "something is wrong" state.
- Keep the angle between 6 and 15 degrees. Less looks like a mistake; more looks like a fall.

## Do not

- Cant text the reader has to read. Keep captions outside the turning layer.
- Use it as decoration on every section: it only means something when the rest is level.

## Reduced motion

The loop stays level and still. `.dutch-in` and `.dutch-hover` show their canted frame without the roll. The pause toggle hides.

## Without JavaScript

`.dutch-in` starts at its canted end state when `play.js` is not loaded.
