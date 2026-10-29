# Live sparkline

Use when: a reading arrives every second or so and people watch the last minute of it, such as CPU on a server monitor.

A sparkline that takes one new point at a time. Each new point is drawn one step past the right edge, and the whole line slides one step left over the time until the next point, at a constant speed, so a steady feed scrolls like a chart recorder instead of jumping. The dot on the right edge rides the line where it crosses the edge, moving from the old reading to the new one in the same time. Over its limit the line, the fill and the dot turn to the warning colour.

[Live demo](https://motion.rujilabs.com/patterns/data-sparkline-live/) · [style.css](style.css) · [data-sparkline-live.js](data-sparkline-live.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="data-sparkline-live/style.css">
<script src="data-sparkline-live/data-sparkline-live.js" defer></script>

<svg class="spark-live" id="cpu" data-points="60" data-max="100" data-limit="85" data-label="CPU on web-01"></svg>
<p><span id="cpu-now">34</span>%</p>
```

```js
var cpu = SparkLive(document.getElementById("cpu"));
cpu.fill(lastMinute);                    // history, drawn at once
socket.onmessage = function (e) {        // then one point per reading
  cpu.push(e.data.cpu);
  now.textContent = Math.round(e.data.cpu);
};
```

The script sets `role="img"` and an `aria-label` with the low, the high and the latest reading on every push, so keep the live number as text next to it.

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-points` | How many readings fit across | `60` |
| `data-min`, `data-max` | The bottom and the top of the scale | `0`, `100` |
| `data-limit` | Draws a dashed line, and adds `.is-over` when the latest reading is above it | none |
| `data-interval` | Time between pushes in ms. The slide lasts exactly this long | `1000` |
| `data-label`, `data-unit` | Start of the accessible label, and the unit after each number | `Live value`, `%` |
| `--sl-line`, `--sl-over`, `--sl-limit` | Line, over the limit, and the limit line | teal, orange |

Set the size with `width` and `height` on the svg. It redraws itself when that changes.

## Do

- Push on a steady beat that matches `data-interval`. The line scrolls at one speed only when the feed does.
- Use a fixed scale (0 to 100 for CPU), so a quiet line looks quiet.

## Do not

- Push faster than you can draw. Over about 10 a second, use a canvas chart.
- Rescale the line to its own range. A two percent wobble would fill the whole height and look like an alarm.

## Reduced motion

Each new reading redraws the line in place: nothing slides and the dot jumps. The demo also holds the board still until you turn Live on.

## See also

[`data-candles`](../data-candles/) for prices, [`line`](../line/) for a line that draws once.
