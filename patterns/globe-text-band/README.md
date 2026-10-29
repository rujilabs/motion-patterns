# Globe text band

Use when: a hero says you ship, sell or work worldwide, and you want one slow, confident object to carry the line.

A line of text printed on a ribbon that wraps a dot globe of real land, on a ring tilted toward the viewer and rolled a little. The ribbon is built from short flat panels: its far half passes behind the ball and shows its plain, darker inside, and panels darken as they turn side-on. Each letter sits flat on the ribbon (one affine transform per letter, since the projection is orthographic), so letters narrow and lean as they come round. The text repeats to fill the ring, spaced so the end meets the start with no gap. The ribbon winds on when the globe scrolls into view, then ribbon and globe turn: the globe east like the earth, once a minute, and the ribbon the other way, three times a minute.

[Live demo](https://motion.rujilabs.com/patterns/globe-text-band/) · [style.css](style.css) · [globe-text-band.js](globe-text-band.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="globe-text-band/style.css">
<script src="globe-text-band/land.js" defer></script>
<script src="globe-text-band/globe-text-band.js" defer></script>

<canvas class="globe-band" role="img" data-text="WE SHIP WORLDWIDE &#8226; 41 COUNTRIES &#8226;"
  data-lon="102.25" data-lat="16" data-tilt="17"
  aria-label="A globe in a ribbon that reads: we ship worldwide, 41 countries">We ship worldwide, 41 countries.</canvas>
```

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-text` | The line on the ribbon. End it with a separator so the repeats read apart | `WE SHIP WORLDWIDE •` |
| `data-lon`, `data-lat` | Where the globe looks at the start | `0 0` |
| `data-tilt` | How far the ring leans toward you, in degrees | `16` |
| `canvas.globe.pause()`, `.play()`, `.running()` | Stop and start the turn | |
| `--globe-band`, `--globe-ribbon`, `--globe-ribbon-inside` | Letters, ribbon, ribbon's inside | brown on cream |
| `--globe-band-font` | Weight and family of the letters. The size is set from the globe | `800 16px system-ui` |
| `--globe-ocean`, `--globe-land`, `--globe-shadow`, `--globe-limb`, `--globe-glint` | Globe colours and shading | |

## Do

- Give it a pause button: it turns for as long as the page is open.
- Use a wide, heavy face in capitals. Thin letters vanish when they narrow at the sides.
- Put the same words in the canvas's fallback text and label.

## Do not

- Write more than about 40 characters. Only the front half of the ribbon is readable at any time.
- Use two of them on a page.

## Reduced motion

The ribbon shows wound on and still, with the text across the front.

## See also

[`text-on-path`](../text-on-path/) for text along a flat curve, [`orbit`](../orbit/).
