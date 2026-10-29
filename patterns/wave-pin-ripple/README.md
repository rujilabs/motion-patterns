# Wave pin ripple

Use when: someone sets a delivery or pickup point on a map, and should feel exactly where the pin landed.

A pin on a drawn street map. Drag it, or tap anywhere and it lifts, flies there on a level line and drops. While it is held it rides above its shadow, so you can see the spot under it. When it lands it squashes on its tip and springs back, and a ripple spreads along the ground under it: three rings a wave apart, moving out at a steady speed. Their height falls as one over the square root of the radius, which is how a circular wave spreads its energy, and with time as the ground damps it, so each ring thins and fades as it grows. The rings sit under the pin and over the streets.

[Live demo](https://motion.rujilabs.com/patterns/wave-pin-ripple/) · [style.css](style.css) · [wave-pin-ripple.js](wave-pin-ripple.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="wave-pin-ripple/style.css">
<script src="play.js"></script>
<script src="wave-pin-ripple/wave-pin-ripple.js" defer></script>

<div class="pin-map" data-x="159" data-y="159" tabindex="0" role="application" aria-roledescription="map"
     aria-label="Delivery map. Arrow keys move the pin, Enter drops it." aria-describedby="address">
  <svg viewBox="0 0 420 300" aria-hidden="true">
    <!-- your streets, houses and park -->
    <g class="pm-ripples"></g>
    <g class="pm-pin">
      <path class="pm-head" d="M0 0C-1.6-6-9-10.4-9-17.4A9 9 0 0 1 9-17.4C9-10.4 1.6-6 0 0Z"/>
      <circle class="pm-hole" cx="0" cy="-17.4" r="3.4"/>
    </g>
  </svg>
</div>
<p id="address" aria-live="polite">No. 14, Jalan SS 2/24</p>
```

Draw the pin with its tip on `0 0`. `data-x` and `data-y` are where it starts, in the map's units. Listen for the drop and look up the address:

```js
map.addEventListener("drop", (e) => lookUp(e.detail.x, e.detail.y));
map.addEventListener("move", (e) => preview(e.detail.x, e.detail.y));   // while it is carried
map.pinMap.drop(240, 150);    // fly there and drop, with the ripple
map.pinMap.place(240, 150);   // just put it there
```

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-x`, `data-y` | Where the pin stands, in the SVG's units. Updated as it moves | Map centre |
| `.pm-ripples` | Where the rings are drawn. Put it after the map and before the pin | Required |
| `--pm-pin` | Pin and ripple colour | Chilli red |
| `--pm-dot`, `--pm-shadow` | The hole in the pin, its shadow | White, soft grey |

Keys: arrows carry the pin 4 units (Shift for 16), Enter or Space drops it. A ripple lives 1.15 s and moves at 105 units a second. The first drop plays when the map scrolls into view.

## Do

- Show the address the pin is on in text, and update it on `drop`. That line is what a screen reader hears.
- Say what is wrong when the pin lands somewhere no rider can stop, like the field in the demo.

## Do not

- Send a ripple on every pointer move. It means "landed here", once per drop.
- Put the ripple over the pin. The pin is the answer, the ripple is where it hit.

## Reduced motion

The pin moves straight to its spot with no lift, flight, squash or ripple. The address still updates, and the house under the pin is still marked.
