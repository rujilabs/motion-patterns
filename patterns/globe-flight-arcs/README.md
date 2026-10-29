# Globe flight arcs

Use when: you show routes from one place to others (airline network, shipping lanes, offices) and want the distance to feel real.

Each route is the great circle between two places, lifted off the surface in the middle, and longer routes climb higher. A dotted ground track runs underneath, so the lift reads as height. A small plane rides each arc: it turns to follow its heading, grows a little at the top of the climb, and its shadow slides along the ground right under it. The planes leave one after another; each airport sends out one ring as its plane lands, and its row in the list gets `is-landed`.

[Live demo](https://motion.rujilabs.com/patterns/globe-flight-arcs/) · [style.css](style.css) · [globe-flight-arcs.js](globe-flight-arcs.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="globe-flight-arcs/style.css">
<script src="globe-flight-arcs/land.js" defer></script>
<script src="globe-flight-arcs/globe-flight-arcs.js" defer></script>

<canvas class="globe-arcs" data-lon="104" data-lat="-6" data-routes="#routes"
  aria-label="Routes from Kuala Lumpur to Tokyo and Sydney">Routes from Kuala Lumpur.</canvas>
<ol id="routes">
  <li data-flight="SA 806" data-from="101.71 2.75 KUL" data-to="140.39 35.77 NRT">Tokyo Narita</li>
  <li data-flight="SA 221" data-from="101.71 2.75 KUL" data-to="151.18 -33.95 SYD">Sydney</li>
</ol>
```

The flights start when the globe scrolls into view. `canvas.globe.play()` flies them again.

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-lon`, `data-lat` | Where the view looks. Aim a little south of the hub so northern routes curve up toward the rim, where lift shows best | `0 0` |
| `data-routes` | Selector for the list whose `[data-to]` items are the routes | Required |
| `data-from`, `data-to` (on each item) | `lon lat CODE`. The code is written next to the airport | Required |
| `data-flight` (on each item) | Name of that flight's clock on an animation timeline | `flight 1` |
| `.is-landed` | Added to an item once its plane lands | |
| `--globe-ocean`, `--globe-land`, `--globe-accent`, `--globe-ink`, `--globe-paper` | Colours: arcs and reached airports use the accent, planes the ink | |
| `--globe-shadow`, `--globe-limb`, `--globe-glint`, `--globe-font` | Shadow, shading and label font | |

## Do

- Keep it to 3 to 7 routes from one hub. More and the arcs become a net nobody reads.
- Use real coordinates: the arc length and lift come from the true distance.

## Do not

- Aim the view straight at the hub when routes are short: lift goes outward, toward you, and an arc seen head-on looks flat.
- Loop the planes. Each flight plays once; give a replay button instead.

## Reduced motion

Every arc is drawn finished, every airport is marked, every row is landed, and no plane flies.

## See also

[`motion-path`](../motion-path/) for a route on a flat map, [`globe-country-picker`](../globe-country-picker/).
