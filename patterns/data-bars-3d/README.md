# 3D bars

Use when: a few big numbers carry a printed-feeling page, such as revenue by quarter in an annual report.

Each bar is a real prism built from three faces in CSS 3D: a front, a right side and a top. The light comes from the upper left, so the top is the brightest face, the front takes the bar colour and the side, turned away, is in shade. The bars stand on a floor under a camera that looks down and from the left, and when the chart scrolls into view they grow from the floor one after another with a single `scaleY` from the foot, so the top face rides up flat and never stretches. A shadow on the floor lengthens with each bar. Values and quarter labels are real text turned back to face the reader, so they never skew with the bars.

[Live demo](https://motion.rujilabs.com/patterns/data-bars-3d/) · [style.css](style.css) · [data-bars-3d.js](data-bars-3d.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="data-bars-3d/style.css">
<script src="play.js"></script>
<script src="data-bars-3d/data-bars-3d.js" defer></script>

<figure class="bars3d" data-play data-max="60" aria-label="Passenger revenue by quarter, RM million">
  <div class="b3-world">
    <ol class="b3-bars">
      <li class="b3" data-value="38.6">
        <span class="b3-prism" aria-hidden="true"><i class="b3-face b3-front"></i><i class="b3-face b3-side"></i><i class="b3-face b3-top"></i></span>
        <i class="b3-cast" aria-hidden="true"></i>
        <span class="b3-label">Q1</span>
        <span class="b3-val">RM 38.6m</span>
      </li>
      <!-- one li per bar -->
    </ol>
  </div>
</figure>
```

To show other numbers, for another year, pass them in order. Each bar eases from its height to the new one:

```js
document.querySelector(".bars3d").bars3d.set([34.1, 37.9, 33.2, 47.5]);
```

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-max` | The value at the full plot height | The largest value |
| `data-value` | This bar's number | Required |
| `--b3-c` | Bar colour, on the chart or on one key bar. The side and top are mixed from it | slate |
| `--b3-h`, `--b3-w`, `--b3-d`, `--b3-gap` | Plot height, bar width, depth and gap | `220px`, `60px`, `42px`, `46px` |
| `--b3-pitch`, `--b3-yaw` | Camera tilt and turn. Keep the yaw negative to see the right sides | `-13deg`, `-24deg` |
| `--b3-stagger` | Delay from one bar to the next | `140ms` |
| `--b3-floor`, `--b3-shadow` | Floor and cast shadow | |

Add your own value lines on a back wall at `translateZ(calc(var(--b3-d) / -2))`, touching the back of the bars, as the demo does. A line further back reads higher than it is.

## Do

- Write the value on every bar. Perspective makes heights hard to compare by eye.
- Keep it to a handful of bars and one key colour. This is for a headline chart, not a dashboard.

## Do not

- Turn the camera far. Past about 30 degrees, near bars look taller than far ones.
- Put a long axis or a dense grid behind it. A flat chart does that job better.

## Reduced motion

The bars, shadows and values show at their full height at once, and a new year jumps straight to its numbers.

## See also

[`bars`](../bars/), the flat version with a count-up.
