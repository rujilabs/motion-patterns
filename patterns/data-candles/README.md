# Live candles

Use when: a price changes all day and people need to read its shape minute by minute, as in a trading or gold savings app.

A candlestick chart that takes live ticks. The candle still forming stretches its body and its wick to every new price, so you watch the high and the low get set. When the minute closes, the whole strip slides one step left and a new candle opens as a flat line at the last close. The price scale holds still until the candles leave it or shrink to under half of it, and then every candle and gridline eases to the new scale together, so the chart never twitches. A dashed line and a tag on the scale follow the last price in the colour of its candle.

[Live demo](https://motion.rujilabs.com/patterns/data-candles/) · [style.css](style.css) · [data-candles.js](data-candles.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="data-candles/style.css">
<script src="data-candles/data-candles.js" defer></script>

<div class="candles" id="chart" data-visible="30" data-decimals="2" role="figure" aria-label="Gold price in RM per gram, one minute candles">
  <p>Gold stood at RM 538.76 a gram at 10:30 am.</p>
</div>
```

Hand it every candle you want on screen, oldest first, on every tick:

```js
var chart = DataCandles(document.getElementById("chart"));
chart.update([
  { t: "10:29", o: 538.32, h: 538.84, l: 538.28, c: 538.76 },
  { t: "10:30", o: 538.76, h: 538.79, l: 538.71, c: 538.74, label: "10:30" } // still forming
]);
```

`t` is the candle's key: the same `t` with new prices stretches that candle, a new `t` opens a new one. Give a candle a `label` to write it under the time axis; it rides along with its candle.

## Options

| Attribute, option or property | Does | Default |
|---|---|---|
| `data-visible` | How many candles fit across | `30` |
| `data-decimals` | Digits after the point on the scale and the tag | `2` |
| `update(candles, { instant: true })` | Jump straight to these candles, for a new range or a resize | animated |
| `--cd-up`, `--cd-down` | Candle colours | green, red |
| `--cd-height` | Plot height, time row included | `240px` |
| `--cd-gutter`, `--cd-axis` | Room for the price scale on the right, and for the time row | `58px`, `22px` |
| `--cd-grid`, `--cd-label` | Gridlines and scale text | |

The chart writes a visually hidden table of the last five closed candles, and rewrites it when a candle closes, not on every tick.

## Do

- Keep each candle honest: the open is the last close, the high and low are the extremes of its ticks.
- Show the forming candle's open, high, low and close as text next to the chart.
- Offer a pause. A live chart never stops on its own.

## Do not

- Tick faster than about four times a second. Each stretch takes 220 ms.
- Rescale on every tick. The chart only rescales when it must, so let it.

## Reduced motion

Every candle, gridline and the price tag jump straight to their new places. The demo also holds the day still until you turn Live on.

## See also

[`line`](../line/) for a line drawn once, [`data-sparkline-live`](../data-sparkline-live/) for a small live line.
