# Cube transition

Four views sit on the four side faces of a 3D cube, and the cube turns a quarter to bring the next face round. While it turns, the frame dips back a little so the near edge stays inside the frame.

[Live demo](https://motion.rujilabs.com/patterns/cube/) · [style.css](style.css) · [cube.js](cube.js)

## Use

`.cube` is a size container: give it a width and a height, or a width and an `aspect-ratio`. Put exactly four `.cube-face` views in its `.cube-box`.

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="cube/style.css">
<script src="cube/cube.js"></script>

<div class="cube" id="trip" data-cube>
  <div class="cube-box">
    <figure class="cube-face">One</figure>
    <figure class="cube-face">Two</figure>
    <figure class="cube-face">Three</figure>
    <figure class="cube-face">Four</figure>
  </div>
</div>
<button type="button" data-cube-go="prev" aria-controls="trip">Back</button>
<button type="button" data-cube-go="next" aria-controls="trip">Next</button>
```

Without `cube.js`, set `--cube-turn` on `.cube` to a whole number yourself: each step of 1 is a quarter turn. Keep counting past 3 so the cube keeps turning the same way.

## Options

| Class, attribute or property | What it does |
|---|---|
| `.cube-y` on `.cube` | Turns over the top edge instead of the side. A `data-cube-y` checkbox with `aria-controls` toggles it |
| `.is-turning` on `.cube` | The dip back mid-turn. `cube.js` adds and removes it |
| `--cube-depth` | Perspective distance. Default `1100px`; smaller is more dramatic |
| `--cube-turn` | Quarter turns so far. The turn is a `--dur-slow` (900ms) transition on `--ease-inout` |

`cube.js` makes the faces turned away `inert` and fires a `cubechange` event with the face index.

## Do

- Use it for four views of the same thing (four days, four sides of a product, four steps).
- Leave a band of background around the cube so the turning corners have somewhere to go.

## Do not

- Put a cube inside a scrolling list: the 3D corners overlap the rows around it.
- Turn it automatically. A spinning cube is hard to read; let the reader turn it.

## Reduced motion

The transition and the dip are removed, so the next face is simply there.
