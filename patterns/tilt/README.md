# Tilt

The camera tips up or down on its tripod, so a tall scene slides through a fixed frame. Tilting up from a person to the top of a building is the classic way to say how tall something is.

[Live demo](https://motion.rujilabs.com/patterns/tilt/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="tilt/style.css">

<div class="tilt-group">
  <div class="tilt">
    <div class="tilt-scene"><!-- a tall drawing or image, 3 frames tall --></div>
  </div>
  <label class="tilt-pause"><input type="checkbox"> Pause</label>
</div>
```

Give `.tilt` a size (an `aspect-ratio` works). The scene fills its width and is `--tilt-span` frames tall.

## Options

| Class or property | What it does |
|---|---|
| `--tilt-span` | How many frames tall the scene is. Default `3` |
| `--tilt-dur` | Time for one sweep, holds included. Default `10s` |
| `.tilt-down` | Starts at the top and tilts down |
| `.tilt-pause` inside `.tilt-group` | A checkbox that pauses the move |

The move runs for more than 5 seconds, so keep the pause toggle ([WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)).

## Do

- Start on something human sized (a door, a person) so the height has a scale.
- Tilt down to arrive somewhere: from the sky to a street, from a sign to the shop under it.

## Do not

- Tilt a page's main content: readers expect to scroll it themselves.
- Run a tilt and a pan in the same frame at once. Pick one direction per shot.

## Reduced motion

The scene does not move. The frame rests at the top (at the bottom with `.tilt-down`) and the pause toggle hides.
