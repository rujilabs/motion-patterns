# Line and area

A line chart drawn by a pen. The line draws itself, a dot rides the pen tip, the area under the line is wiped in right behind the tip, and each note lands as the pen reaches it. A dashed reference line (last period, a target) is wiped in first.

[Live demo](https://motion.rujilabs.com/patterns/line/) · [style.css](style.css) · [line.js](line.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="line/style.css">
<script src="play.js"></script>

<figure class="line-chart" data-play style='--line-path: path("M0 246 C 9 243 ... 462 136")'>
  <svg viewBox="0 0 640 260" role="img" aria-label="Describe the whole line in one sentence">
    <path class="line-prev" d="..."/>
    <path class="line-area" d="M0 246 C 9 243 ... 462 136 L462 250 L0 250 Z"/>
    <path class="line-pen" pathLength="1" d="M0 246 C 9 243 ... 462 136"/>
    <circle class="line-dot" r="6"/>
  </svg>
  <p class="line-note" data-x="320">Peak 5.3 kW</p>
</figure>

<script src="line/line.js"></script>
```

The pen, the dot's `--line-path` and the top edge of the area are the same path data. Put the dot's circle at 0,0: the path moves it. Load `line.js` at the end of the body.

## Parts

| Class | What it does |
|---|---|
| `.line-pen` | The line. Needs `pathLength="1"`. Draws over `--dur-draw` (1600ms) |
| `.line-dot` | Rides the pen tip along `--line-path` with CSS `offset-path` |
| `.line-area` | The pen's path closed down to the baseline. Wiped in under the pen |
| `.line-prev` | Optional reference line, wiped in over `--dur-slow` before the pen |
| `.line-note` | A label placed over the chart. `data-x` is its x in the svg's own units: it lands when the pen gets there |
| `--line-delay` | On the chart. Holds the pen, so the reference line reads first (the demo uses 450ms) |

## Why the script

The pen draws at an even speed along its length, not along x. A steep stretch is long and narrow, so a plain left-to-right wipe falls behind the pen on the climbs and runs ahead on the flats. `line.js` measures the path and gives the area and the notes keyframes that follow the tip exactly, with the pen's own duration, delay and curve. Without it the area still wipes left to right in the same time and the notes land at the end.

## Do

- Write the line's story in the svg's `aria-label`: start, peak, the odd moment, where it ends.
- Keep notes to two or three. They are the reading order.

## Do not

- Ride a dot on a line with many sharp corners: `offset-path` turns it through every one.
- Give the area its own curve or duration. It only looks right glued to the pen.

## Reduced motion

The line, the area, the dot and every note show in their final state, and `line.js` does nothing.
