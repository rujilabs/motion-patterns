# Globe country picker

Use when: someone picks a country in a form (shipping, billing, region) and you want to show where that is.

A dot globe of real land turns to the picked country. The centre of the view travels the short way round, along a great circle (slerp), so the turn never goes the long way or tips over the pole. When it arrives, the country's land lights up in the accent and a pin lands with one ring. The globe is also a toy: drag it, flick it and it keeps turning a little before friction stops it.

[Live demo](https://motion.rujilabs.com/patterns/globe-country-picker/) · [style.css](style.css) · [globe-country-picker.js](globe-country-picker.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="globe-country-picker/style.css">
<script src="globe-country-picker/land.js" defer></script>
<script src="globe-country-picker/globe-country-picker.js" defer></script>

<canvas class="globe-picker" tabindex="0"
  data-lon="138.25" data-lat="36.2" data-label="Japan"
  data-spots="139.6 36.4 3.1, 135.2 34.6 2.4, 142.8 43.3 2.5"
  data-from-lon="101.08" data-from-lat="4.6" data-from-label="Ipoh"
  aria-label="Globe turned to Japan">Shipping to Japan from Ipoh.</canvas>
```

To turn it, set the new country on the canvas (label and spots first, then the position):

```js
Object.assign(globe.dataset, { label: "Canada", spots: "-100 60 10.5, -76 55 9", lat: 56.13, lon: -106.35 });
```

`land.js` holds Natural Earth 110m land (public domain) as `[[lon, lat], ...]`, made with `node scripts/globe-dots.mjs --step 2.5`. A smaller step gives more dots and a bigger file.

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-lon`, `data-lat` | The picked country's centre. Change either to turn | Required |
| `data-label` | Name written next to the pin | none |
| `data-spots` | The country's land as circles, `lon lat radius` in degrees, comma separated | a 4 degree circle round the pin |
| `data-from-lon`, `data-from-lat`, `data-from-label` | Where the parcel leaves from: a small ink dot. The first turn starts here | none |
| `canvas.globe.turnTo(lon, lat)` | Turn the view without picking anything | |
| `--globe-ocean`, `--globe-land`, `--globe-accent`, `--globe-ink`, `--globe-paper` | Colours | blue grey and red |
| `--globe-shadow`, `--globe-limb`, `--globe-glint` | Contact shadow colour, rim darkness and sunlit side, 0 to 1 | `.18`, `.22` |
| `--globe-font` | Label font | `600 12px system-ui` |

Keys when the globe has focus: arrows turn it 20 degrees (45 with Shift), Home turns back to the picked country.

## Do

- Keep the real control a list, select or listbox. The globe shows the answer, it is not the only way to give it.
- Use real centroids, and a few spots per country so neighbours do not light up with it.

## Do not

- Use it for a list of 200 countries with tiny ones: a 1 degree country has no dots at 110m. The pin still lands, but nothing lights.
- Put it where the page needs to scroll under a finger: the canvas takes the drag (`touch-action: none`).

## Reduced motion

The globe jumps straight to the country, already lit, and a flick stops the moment the finger lifts.

## See also

[`globe-flight-arcs`](../globe-flight-arcs/), [`globe-day-night`](../globe-day-night/).
