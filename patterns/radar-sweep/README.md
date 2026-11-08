# Radar sweep

A waiting screen for "finding someone near you" (a rider, a driver, a cleaner, a court partner). An arm sweeps round from north, once every 2.2 s, and lights each point it passes; the glow fades over 0.9 s and the point stays faintly marked once seen, so the map fills in as the search goes on. When your code calls `found(i)`, the arm does not jump: it runs on until it next points at that rider and stops there. The others fade, a dashed line draws out from you to the rider, the rider rings twice and `found` fires.

[Live demo](https://motion.rujilabs.com/patterns/radar-sweep/) · [style.css](style.css) · [radar-sweep.js](radar-sweep.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="radar-sweep/style.css">
<script src="radar-sweep/radar-sweep.js" defer></script>

<div class="radar">
  <canvas class="rs-canvas" data-period="2200" data-rings="300 m,600 m,900 m" aria-hidden="true"></canvas>
  <button type="button" data-pause aria-pressed="false" hidden>Pause</button>
</div>
<p role="status" id="status">Finding a rider near you.</p>
```

```js
const radar = document.querySelector(".rs-canvas");
radar.radar.set(riders.map((r) => ({ x: r.east / 900, y: -r.north / 900 })));  // -1 to 1, the edge is 1
radar.radar.search();
const match = await waitForMatch();
radar.radar.found(match.index);
radar.addEventListener("found", () => { status.textContent = "Faizal is on the way, 3 minutes away."; }, { once: true });
```

## Options

| Name | What it does | Default |
|---|---|---|
| `data-period` | Milliseconds for one turn of the arm | `2200` |
| `data-rings` | Labels for the three rings, comma separated | none |
| `.set(points)` | `{ x, y }` for every point, from -1 to 1 | |
| `.search()`, `.found(i)` | Start sweeping; stop on point `i` | |
| `.pause()`, `.play()` | Stop and start every clock | |
| `spot` event | A point was seen for the first time: `detail.count`, `detail.index` | |
| `found` event | The found point has finished ringing: `detail.index` | |
| `--rs-disc`, `--rs-ring`, `--rs-label` | Disc, rings, ring labels | Mint, grey green |
| `--rs-sweep`, `--rs-found`, `--rs-you` | Arm and points, the found point, the centre | Green, orange, ink |

The script wires a `button[data-pause]` inside the closest `.radar`: it shows while searching, toggles `aria-pressed`, and hides once a rider is found. A search can run longer than 5 seconds, so keep it.

## Do

- Put the real state in text in a `role="status"` element. The canvas is hidden from screen readers.
- Use real positions. A radar that lights made-up dots tells people there are riders when there are none.

## Do not

- Do not keep sweeping forever. After a minute or so, say so in text and offer to widen the search or try again.
- Do not speed the arm up to make the wait feel shorter. It reads as panic.

## Reduced motion

The arm never turns. Every point shows faintly, and `found()` draws the end state at once: the line to the rider and its mark, with no rings. `found` still fires. Without the script the canvas shows the rings as a CSS still.
