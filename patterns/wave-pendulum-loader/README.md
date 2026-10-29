# Wave pendulum loader

Use when: a search or report takes a few seconds to come back, and the wait should look like work in progress that stops the moment the answer arrives.

A row of pendulums hangs from one rail. When the search goes out, every bob is pulled back together and let go. Each pendulum has a real period: in a cycle of 24 seconds the first swings 20 times, the next 21, and so on, and each string is as long as its period asks (length goes with the period squared, so the slow ones hang lowest). Released in line, they drift out of step into a travelling wave, then two groups, and would come back into line at the end of the cycle. We look down on them at 57 degrees, so each swing shows as a rise and fall, nearer bobs are drawn larger, and their shadows on the floor trace the same wave. When the results land, the swings die away, each one still at its own period, the bobs come to rest, and `settled` fires.

[Live demo](https://motion.rujilabs.com/patterns/wave-pendulum-loader/) · [style.css](style.css) · [wave-pendulum-loader.js](wave-pendulum-loader.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="wave-pendulum-loader/style.css">
<script src="wave-pendulum-loader/wave-pendulum-loader.js" defer></script>

<canvas class="pendulum-wave" data-count="12" data-cycle="24" data-first="20" aria-hidden="true"></canvas>
<p role="status" id="status">Searching homestays in Cameron Highlands.</p>
```

```js
const wave = document.querySelector(".pendulum-wave");
wave.pendulum.start();                       // the request goes out
const results = await fetch(url).then((r) => r.json());
wave.pendulum.land();                        // the answer is in: the swings die away in 1 s
wave.addEventListener("settled", hideLoader, { once: true });
```

Show the results as soon as they land. The demo fades the loader while the swings die down and lets the rows rise in half a second later.

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-count` | Number of pendulums | `12` |
| `data-cycle` | Seconds for the whole pattern to come back into line | `24` |
| `data-first` | Swings of the first (longest) pendulum in one cycle. Pendulum n makes this plus n | `20` |
| `--pw-bob`, `--pw-bob-light`, `--pw-bob-dark` | The bob, where the light hits it, the side away from it | Brass |
| `--pw-string`, `--pw-rail`, `--pw-shadow` | Strings, rail and pivots, floor shadows | Grey green, deep green |

The canvas is `aspect-ratio: 5 / 2` by default; give it a height to change that. `pause()` and `play()` stop and start every clock, for a wait that runs past 5 seconds.

A higher `data-first` keeps the bobs closer in step for longer; a shorter `data-cycle` makes the whole pattern run faster. The defaults show the travelling wave within about two seconds, which suits a two to five second wait.

## Do

- Say what is loading in text next to it, in a `role="status"` element. The canvas is hidden from screen readers.
- Call `land()` the moment the data arrives, even if the wave is mid-swing. It is built to stop from any point.

## Do not

- Use it for waits under a second. The bobs need about two seconds to fall out of step.
- Keep it for a wait you cannot end. A wait of more than a few seconds needs a progress count or a way out, not a longer show.

## Reduced motion

The bobs hang still in a row. `start()` and `land()` still work and `settled` still fires, so your page code is the same; the status text does the talking.
