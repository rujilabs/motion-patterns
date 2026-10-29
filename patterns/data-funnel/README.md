# Funnel drop-off

Use when: people move through steps and most leave on the way, and you need to show where they leave, as in a sales funnel from enquiry to signed contract.

The stages fill one after another from the top when the funnel scrolls into view. Every bar after the first arrives at the width of the stage before it, which is everyone who came through, and then narrows to its own width. What it lets go of stays behind as a hatched band on both sides, so the drop-off is not a number you have to work out: it is the part of the bar that left. The count lost and its share fade in beside each stage as it settles.

[Live demo](https://motion.rujilabs.com/patterns/data-funnel/) · [style.css](style.css) · [data-funnel.js](data-funnel.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="data-funnel/style.css">
<script src="play.js"></script>
<script src="data-funnel/data-funnel.js" defer></script>

<figure class="funnel" data-play aria-label="Rooftop solar sales, Q3 2026">
  <ol>
    <li class="fn-stage" data-value="1284">
      <p>Enquiries <span class="fn-count">1,284</span></p>
      <div class="fn-track" aria-hidden="true"><span class="fn-lost"></span><span class="fn-bar"></span></div>
    </li>
    <li class="fn-stage" data-value="612">
      <p>Site survey booked <span class="fn-count">612</span></p>
      <div class="fn-track" aria-hidden="true"><span class="fn-lost"></span><span class="fn-bar"></span></div>
      <p class="fn-drop"><span class="fn-lost-n">672</span> dropped, <span class="fn-lost-p">52.3%</span></p>
    </li>
    <!-- one li per stage, largest first -->
  </ol>
</figure>
```

Write the counts and drops in the markup too: they are what shows without the script and what screen readers read. The script rewrites them from `data-value`, so they never disagree with the bars. For another period, change the `data-value` attributes and call `funnel.update()` to play the fill again:

```js
stages.forEach(function (s, i) { s.dataset.value = q2[i]; });
document.querySelector(".funnel").funnel.update();
```

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-value` | The stage's count. Each must be at most the one before | Required |
| `.fn-count`, `.fn-lost-n`, `.fn-lost-p` | Filled in from the counts: the stage's count, the number lost since the stage before, and that as a share of it | |
| `--fn-c` | Bar colour. The hatching is mixed from it | forest green |
| `--fn-h` | Bar height | `30px` |
| `--fn-step` | Delay from one stage to the next | `520ms` |

## Do

- Keep to 3 to 6 stages, largest first, each one a real step people take.
- Name the biggest leak in words under the chart.

## Do not

- Use it for parts of a whole that do not flow into each other. That is a donut or a bar chart.
- Scale the bars by area or draw a cone. Width is what people compare.

## Reduced motion

Every bar, hatched band and drop label shows at once, and a new period jumps straight to its numbers.

## See also

[`bars`](../bars/) for values side by side.
