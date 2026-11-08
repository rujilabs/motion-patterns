# Depth text

A headline extruded in real 3D layers. It swings in once on load, tilts toward the pointer as it moves over its area, and springs back to its rest pose when the pointer leaves or the finger lifts. Keyboard focus tilts it to a set pose, so the depth shows without a mouse. Made for one bold name on a poster-like hero: a venue, an event, a game.

[Live demo](https://motion.rujilabs.com/patterns/depth-text/) · [style.css](style.css) · [depth-text.js](depth-text.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="depth-text/style.css">
<script src="depth-text/depth-text.js" defer></script>

<section data-depth-area>
  <h1><a class="dt" href="#day-pass" data-depth="12">Batu Tujuh</a></h1>
</section>
```

The script moves the text into a face span and stacks aria-hidden copies behind it, each a step further back and darker, so screen readers read the name once. The tilt follows the pointer over the closest `[data-depth-area]` (or the headline itself), which keeps `touch-action: pan-y`, so the page still scrolls. The spring loop runs only while it is moving.

Without the script a four-step `text-shadow` gives the same extruded look, flat.

## Options

| Name | What it does | Default |
|---|---|---|
| `data-depth` | Number of layers, 2 to 24 | `12` |
| `data-depth-tilt` | Largest tilt, in degrees | `22` |
| `data-depth-rest` | Rest pose, `rotateX,rotateY` in degrees | `10,-16` |
| `--dt-step` | Distance between layers; more is deeper | `-.04em` |
| `--dt-side` | Colour of the sides; deeper layers get darker | `#888` |
| `--dt-persp` | Perspective; lower is more dramatic | `900px` |

## Do

- Use one or two short words at a large size, 48 px and up, in a heavy weight.
- Keep the rest pose slightly turned so the depth reads before anyone moves the pointer.

## Do not

- Do not put an `opacity` below 1 or a `filter` on `.dt` or its layers: browsers flatten the 3D and the depth turns into a smear.
- Do not use it on more than one headline per view.

## Reduced motion

No swing in and no tilt: the headline sits at its rest pose, extruded, and never moves.
