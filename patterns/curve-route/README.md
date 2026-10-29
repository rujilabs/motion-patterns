# Curve route

Use when: a customer tracks a delivery with several drops before theirs, and should see where the van is on the way.

The route is one SVG path from the shop to the door. When the map scrolls into view the route draws at a steady pen speed, and each stop pops at the moment the line reaches it. Then the van rides the curve from the shop to its current stop, and the travelled part of the route grows under it on the same clock. Each later courier scan moves the van on from where it is. The van is moved by keyframes sampled from the path itself, position and heading together, so it turns with every bend and never spins the long way round. Its shadow is a copy that stays offset toward the floor whichever way the van faces, the stops it passes fill in as it goes by, and when it stops the load lurches forward a pixel.

[Live demo](https://motion.rujilabs.com/patterns/curve-route/) · [style.css](style.css) · [route.js](route.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="curve-route/style.css">
<script src="play.js"></script>
<script src="curve-route/route.js" defer></script>

<div class="curve-route" data-at="3" role="img" aria-label="The van is at stop 4 of 7, Falim.">
  <svg viewBox="0 0 400 280" aria-hidden="true">
    <!-- your map art here -->
    <path class="cr-route" d="M38 232 C47 221 70 172 92 168 C ..."/>
    <circle class="cr-stop" cx="38" cy="232" r="5.5"/>
    <circle class="cr-stop" cx="92" cy="168" r="5.5"/>
    <!-- one circle per stop, in route order, centred on the path -->
    <g class="cr-van">
      <g class="cr-body"><!-- the van seen from above, centred on 0 0, nose pointing right --></g>
    </g>
  </svg>
</div>
```

`route.js` finds where each stop sits along the path, so the stops only have to be on the curve. Move the van with data or code:

```js
route.dataset.at = 4;                      // rides on from where it is
route.go(4);                               // the same
route.replay(3);                           // draws the whole route again, then rides to stop 3
route.addEventListener("arrive", (e) => updateList(e.detail.index));
```

Keep the stop list in text next to the map, and update the `aria-label`. The map is a picture of that list.

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-at` | Index of the stop the van is at, from 0 | `0` |
| `.cr-route` | The path. Draw it with smooth curves through the stops | Required |
| `.cr-stop` | One circle per stop, in order. The last one is the door | Required |
| `.cr-van`, `.cr-body` | The van and its body. The body is copied for the shadow | Required |
| `--cr-route`, `--cr-done` | Route still to drive, travelled part | Sage, deep green |
| `--cr-van`, `--cr-roof`, `--cr-glass` | Van colours | Orange, cream, near black |

The route draws in 1 s. A ride lasts 450 ms plus 3.2 ms per unit of path, at most 1.6 s, on `--ease-inout`, so the van pulls away and brakes.

## Do

- Draw the van from above. Seen from the side it would drive upside down on any stretch that heads left.
- Ride only on a real scan. The van shows where the last scan put it, not a guess.

## Do not

- Feed it live GPS points. Every new point would restart a ride. It is for scans at stops.
- Put more than about 10 stops on one map. The curve gets too tight to read the bends.

## Reduced motion

Nothing draws or rides. The whole route shows, the travelled part is filled to the current stop, and the van is parked there facing the road. A scan moves it straight to the next stop.

## See also

[`motion-path`](../motion-path/), one rider with CSS `offset-path` from a shop to one door.
