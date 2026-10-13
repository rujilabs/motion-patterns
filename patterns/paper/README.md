# Paper diorama build

A cut-paper scene that builds back to front: hills slide up and land, upright pieces hinge up like a pop-up book, and extras arrive once it is built. Flat SVG shapes, a double paper shadow and one grain overlay.

[Live demo](https://motion.rujilabs.com/patterns/paper/) · [style.css](style.css)

Recreated from scratch after an AI video prompt by [@dikipirasaputra](https://www.threads.com/@dikipirasaputra); see `meta.json`.

## Use

```html
<svg class="paper" data-play viewBox="0 0 400 260" role="img" aria-label="…">
  <defs><!-- paper shadow and grain filters, see index.html --></defs>
  <rect class="layer" data-layer="0" …/>                 <!-- back card: fades -->
  <path class="layer" data-layer="1" filter="url(#paper-shadow)" …/>
  <g class="layer fold" data-layer="2" filter="url(#paper-shadow)">…</g>  <!-- pops up -->
  <g class="paper-after">…</g>                             <!-- after the build -->
  <rect class="grain" filter="url(#paper-grain)" …/>
</svg>
```

Needs [`play.js`](../../play.js) to start the build when the scene is in view.

## Options

| Class or property | What it does |
|---|---|
| `data-layer="N"` | Build order, 0 to 12. Each step waits `--stagger-paper` (500ms) |
| `.fold` | The piece hinges up from its base instead of sliding. Use it for houses, trees, signs |
| `.paper-after` | Fades in once the last layer has landed |
| `--paper-layers` | The highest `data-layer` in the scene, so `.paper-after` knows when that is. Default 8 |
| `.paper-quick` | Halves the step to 250ms |
| `--tilt` | A layer can land at an angle |

## Look

- Flat fills from the palette, 3 to 4 tints of each colour, lighter for far layers. One gradient is fine on the back card, nowhere else.
- One light direction. Shadow colour from the palette's darkest ink at low alpha, never black.
- No text inside the scene: put the headline in HTML on top, with `.paper-after` if it should wait.

## Do

- Use one paper scene per page, as the hero. A full build takes about 4 to 6 seconds.
- Use `.paper-quick` anywhere else.

## Do not

- Replay the build on scroll. It plays once.
- Hide the page's headline until the build finishes if the scene is the first thing on the page; keep the headline readable from the first frame.

## Reduced motion

The scene shows complete, with every extra in place.
