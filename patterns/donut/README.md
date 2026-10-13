# Donut and gauge

One pen draws the whole donut. The segments are static; a mask circle draws round once, so the sweep is one continuous stroke that lifts at every gap, and the total in the middle counts on the same clock and curve. A gauge needle swings past its value and settles while the arc fills. No script.

[Live demo](https://motion.rujilabs.com/patterns/donut/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="donut/style.css">
<script src="play.js"></script>

<figure data-play>
  <svg class="donut" viewBox="0 0 200 200" role="img" aria-label="Spending by category">
    <defs>
      <mask id="sweep" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200">
        <circle class="donut-pen" cx="100" cy="100" r="80" pathLength="100"/>
      </mask>
    </defs>
    <g transform="rotate(-90 100 100)">
      <circle class="donut-track" cx="100" cy="100" r="80" pathLength="100"/>
      <g mask="url(#sweep)">
        <circle class="donut-seg" style="--v: 60; --at: 0; --c: #1e2229" cx="100" cy="100" r="80" pathLength="100"/>
        <circle class="donut-seg donut-key" style="--v: 40; --at: 60; --c: #ee3b2b" cx="100" cy="100" r="80" pathLength="100"/>
      </g>
      <circle class="donut-tip" cx="180" cy="100" r="4.5"/>
    </g>
  </svg>
  <figcaption>RM <span class="count count-k" style="--to: 3200"><span class="count-text">3,200</span></span></figcaption>
</figure>
```

Every circle keeps `pathLength="100"`, so `--v` and `--at` are plain percentages of the ring.

## Options

| Class or property | Does | Notes |
|---|---|---|
| `.donut-seg` with `--v`, `--at`, `--c` | One segment: its share, where it starts (the sum of the shares before it), its colour | Shares should add to 100 |
| `.donut-pen` | The mask that draws the ring once on `--ease-inout` over `--dur-draw` | Required for the sweep |
| `.donut-key` | Thickens one segment on the spring once the pen has passed | One per chart |
| `.donut-tip` | A nib that rides the front of the pen, then lifts off | Optional |
| `--donut-w`, `--donut-gap` | Ring thickness (22) and the gap between segments (0.9) | On `.donut` |
| `.gauge` with `--v` | Half ring and needle; `.gauge-pen` fills the arc, `.gauge-needle` swings to `--v` | `--gauge-delay`, `--gauge-dur` to sequence it |
| `.count` with `--to` | Counts from 0 to `--to` with no script | `--count-dur`, `--count-ease`, `--count-delay` to share a clock |
| `.count-k` | Adds the thousands comma | Needs CSS `round()` and `mod()` |

## Do

- Give the count the same duration and curve as the thing it measures. The demo's gauge count uses the needle's curve, so the number reads the needle.
- Use `.donut-key` for the one segment the text is about, and nothing else.

## Do not

- Put `--ease-spring` on the gauge. A needle that reads 82 on its way to 68 looks like a wrong number; the gauge uses `--ease-paper`, a slight overshoot.
- Draw more than about 7 segments. Group the small ones into "Other".

## Browser notes

- The count needs `@property` (all current browsers). Without it the number jumps to the end.
- `.count-k` needs CSS `round()` and `mod()`. Without them the number shows without the comma.

## Reduced motion

The ring, the arc and the needle show in their final place, the key segment is already thick, and the counts show their final number.
