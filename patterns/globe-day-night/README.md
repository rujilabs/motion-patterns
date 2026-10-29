# Globe day and night

Use when: people in different time zones need to see who is in daylight now (a support rota, a world clock, a call planner).

A dot globe lit by the real sun. For the date and the UTC hour on the canvas it works out where the sun is overhead (declination from the day of the year, longitude from the clock, corrected by the equation of time), and shades every point by the sun's height over its horizon. Night fades in over civil twilight, the last 6 degrees, so the line is soft where it really is soft. The sunlit side brightens round the point under the sun, which gets a small sun mark. Places listed in the page get `is-night` when the sun is down there. Drag the hour and the line sweeps; drag the globe to turn it.

[Live demo](https://motion.rujilabs.com/patterns/globe-day-night/) · [style.css](style.css) · [globe-day-night.js](globe-day-night.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="globe-day-night/style.css">
<script src="globe-day-night/land.js" defer></script>
<script src="globe-day-night/globe-day-night.js" defer></script>

<canvas class="globe-daynight" tabindex="0" data-date="2026-06-22" data-utc="13.5"
  data-lon="58" data-lat="16" data-places="#cities" aria-label="Day and night at 13:30 UTC">Day and night.</canvas>
<ul id="cities">
  <li data-place="101.69 3.14 KL">Kuala Lumpur</li>
  <li data-place="-0.13 51.51 London">London</li>
</ul>
```

```js
globe.globe.setUtc(21.25);   // jump to 21:15 UTC
globe.globe.play();          // sweep a whole day in about nine seconds
globe.addEventListener("globe:time", (e) => console.log(e.detail.utc));
```

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-date` | The date, `YYYY-MM-DD`. Sets how far the sun is north or south | `2026-03-20` |
| `data-utc` | Hours UTC, decimals allowed. Change it to move the line | `0` |
| `data-lon`, `data-lat` | Where the view looks at first, and where Home goes back to | `0 0` |
| `data-places` | Selector for a list whose `[data-place]` items (`lon lat Label`) are marked on the globe and get `is-night` | none |
| `canvas.globe.setUtc(h)`, `.play()`, `.pause()`, `.playing()` | Set the hour, sweep a day, stop | |
| `globe:time`, `globe:sweepend` | Events: the hour changed (`detail.utc`), the sweep stopped | |
| `--globe-night`, `--globe-night-depth`, `--globe-night-land` | Night colour, how dark it gets (0 to 1), land dots at night | navy, `.74` |
| `--globe-ocean`, `--globe-land`, `--globe-sun`, `--globe-ink`, `--globe-paper`, `--globe-shadow`, `--globe-limb`, `--globe-font` | Day colours, shading and labels | |

Keys when the globe has focus: arrows turn it 20 degrees (45 with Shift), Home goes back to the start view.

## Do

- Run it on a simulated clock with a visible hour control, starting at a set time, so it looks the same for everyone.
- Pick a start view where the line crosses the middle of the ball. Facing the sun, the line sits on the rim and nothing shows.

## Do not

- Use it to tell people what time it is somewhere. Write the local times next to it, as text.
- Leave the day sweep running without a pause button.

## Reduced motion

The hour slider still moves the line, one step at a time, with nothing in between. There is no sweep, and a flick stops dead.

## See also

[`globe-live-dots`](../globe-live-dots/), [`globe-country-picker`](../globe-country-picker/).
