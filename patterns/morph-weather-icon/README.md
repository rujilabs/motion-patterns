# Weather icon morph

Use when: a forecast shows one condition at a time (by hour, by day, or live) and the icon should change with it, not blink from one picture to the next.

One icon, five conditions: sun, partly cloudy, cloud, rain and a clear night. It is always the same few parts, so every shape has a partner to become. The body is one path of six curves: as the sun it is a circle, as a cloud three bumps on a flat base, and the six joints sit at the same angles round the middle in both, so the disc swells into the bumps instead of folding. The eight rays slide in and shrink behind the cloud, then fall out below it as the rain streaks. For partly cloudy a small sun rises behind the cloud with its rays, and at night a shadow slides across the disc to cut the moon. Every number rides its own spring, so dragging fast through the hours changes course mid-way with no jump.

[Live demo](https://motion.rujilabs.com/patterns/morph-weather-icon/) · [style.css](style.css) · [weather-icon.js](weather-icon.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="morph-weather-icon/style.css">
<script src="morph-weather-icon/weather-icon.js" defer></script>

<svg class="wx-icon" viewBox="0 0 96 96" data-condition="sun" role="img" aria-label="Sunny"></svg>
```

The script draws the parts into the svg. To change the weather, change the attribute (and the label):

```js
icon.setAttribute("data-condition", "rain");
icon.setAttribute("aria-label", "Heavy showers");
```

The same element works as a small static icon in a list: it only moves when its condition changes. Add icons after the page has loaded with `WeatherIcon.init()`.

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-condition` | `sun`, `partly`, `cloud`, `rain` or `moon`. Change it to morph | `sun` |
| `--wx-sun` | Sun disc, rays and the small sun behind a cloud | Warm yellow |
| `--wx-cloud`, `--wx-rain-cloud` | Cloud, and the heavier cloud for rain | White, grey blue |
| `--wx-drop` | Rain streaks | Pale blue |
| `--wx-moon` | Moon | Cream |
| `--wx-fade` | How long a colour takes to change | `420ms` |

Set the colours for the background the icon sits on: the defaults are for a sky-coloured panel, and the demo's hour strip sets darker ones for white paper.

## Do

- Drive it from a control people move through: an hour strip, a day picker, a timeline. The morph shows what changed between two steps.
- Colour the panel behind it with the condition as well, as the demo does with the sky. The two together read faster than either.
- Keep the text next to it ("Heavy showers, 6 mm"). The icon is a summary; the words carry the detail.

## Do not

- Animate it on a loop (drifting clouds, falling rain) on a forecast. Moving weather on a still page reads as live radar.
- Add a condition by drawing a new picture. Build it from the same parts, with the body as six curves in the same order, or it will fold on the way in.
- Use it below about 24 px. The rays and streaks turn to noise; use a static set there.

## Reduced motion

The icon jumps straight to the new condition and its colours change with it. Nothing springs.
