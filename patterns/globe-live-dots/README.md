# Globe live dots

Use when: you show where people are right now (visitors on a shop, players online, riders on shift).

Each place is a dot on a globe of real land, sized by the square root of its count so area tracks the number, and it sends out a ring every couple of seconds. Busy places (40 or more) ring twice as often. Each place has its own fixed phase, so the rings never fire in step. Rings lie on the surface: they flatten toward the rim like everything else on the ball. The dots grow in one after another when the globe scrolls into view, and when the counts change they all ease to their new sizes together; places that empty shrink away. The busiest few are named, and a name that would sit on another is left out.

[Live demo](https://motion.rujilabs.com/patterns/globe-live-dots/) · [style.css](style.css) · [globe-live-dots.js](globe-live-dots.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="globe-live-dots/style.css">
<script src="globe-live-dots/land.js" defer></script>
<script src="globe-live-dots/globe-live-dots.js" defer></script>

<canvas class="globe-live" id="globe" data-lon="112" data-lat="6" aria-label="Readers on the shop now, by city">Readers on the shop now.</canvas>
```

```js
document.getElementById("globe").globe.set([
  { label: "Kuala Lumpur", lon: 101.69, lat: 3.14, count: 62 },
  { label: "Manila", lon: 120.98, lat: 14.6, count: 25 }
]);
```

Call `set()` whenever the numbers change (every poll or socket message). It can be called before the globe is in view.

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-lon`, `data-lat` | Where the view looks | `0 0` |
| `canvas.globe.set(places)` | `{ label, lon, lat, count }` for every place. Places missing from a call shrink to nothing | |
| `canvas.globe.pause()`, `.play()`, `.running()` | Stop and start the rings | |
| `--globe-accent` | Dots and rings | cobalt |
| `--globe-ocean`, `--globe-land`, `--globe-ink`, `--globe-paper`, `--globe-shadow`, `--globe-limb`, `--globe-glint`, `--globe-font` | Globe colours, shading and labels. Keep the land quiet so the live dots lead | |

## Do

- Give it a pause control: the rings never stop on their own.
- Say in words how many people are out of view. A globe only shows half the world.

## Do not

- Animate a new size for every single visitor. Batch the counts and call `set()` once a poll.
- Put cities a few kilometres apart on a globe this size; merge them into one place.

## Reduced motion

Every dot shows at its size, with no rings, and new counts jump straight to their new sizes.

## See also

[`pulse`](../pulse/) and [`ripple`](../ripple/) for a single dot, [`globe-day-night`](../globe-day-night/).
