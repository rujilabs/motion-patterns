# Depth parallax

Layers at different depths shift by different amounts, so a flat scene reads as near and far. The near layers follow the pointer the most, as if you leant to look around them, or the whole scene drifts in a slow loop.

[Live demo](https://motion.rujilabs.com/patterns/depth-parallax/) · [style.css](style.css) · [parallax.js](parallax.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="depth-parallax/style.css">
<script src="depth-parallax/parallax.js"></script>

<div class="parallax parallax-loop" data-parallax aria-hidden="true">
  <svg class="parallax-layer parallax-far">…</svg>
  <svg class="parallax-layer parallax-mid">…</svg>
  <svg class="parallax-layer parallax-front">…</svg>
</div>
```

Draw each layer bigger than the frame: layers overhang it by twice `--parallax-range` on every side.

## Options

| Class or property | What it does |
|---|---|
| `.parallax-far`, `-mid`, `-near`, `-front` | Depth 0.15, 0.4, 0.75 and 1. Or set `--depth` (0 to 1) yourself |
| `data-parallax` + `parallax.js` | Follows the pointer; the layers ease back home when it leaves |
| `.parallax-loop` | A slow drift back and forth, `--parallax-every` each way (default `7s`). Pauses while the pointer is over the scene |
| `.parallax-pause` inside a `.parallax-group` | A checkbox that stops the drift |
| `--parallax-range` | How far the closest layer moves. Default `16px` |

## Do

- Use three to five layers, and leave the horizon still. Depth comes from the difference between layers, not from the amount of movement.
- Keep the range small. A few pixels on the closest layer is enough.

## Do not

- Put text or buttons on a moving layer.
- Fill a whole page with it: large areas moving under the pointer can make people feel unwell.

## Reduced motion

Every layer stays in place, the pointer is ignored and the pause toggle hides.
