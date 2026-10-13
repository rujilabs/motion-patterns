# Bars and count-up

Bars spring up from the baseline, and each value label rides the top of its own bar while it counts up. The fill and the label share one duration, one delay and one curve, so the number stays on the bar through the overshoot instead of chasing it.

[Live demo](https://motion.rujilabs.com/patterns/bars/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="bars/style.css">
<script src="play.js"></script>

<ol class="bars" data-play aria-label="Cups sold per hour">
  <li style="--v: .53; --to: 112">
    <span class="bar-col">
      <span class="bar-fill"></span>
      <span class="bar-tag"><span class="bar-num"><span class="visually-hidden">112 cups</span></span></span>
    </span>
    <span class="bar-label">7 am</span>
  </li>
  <!-- one li per bar -->
</ol>
```

Bring your own visually-hidden class for the real number (the demo calls it `.vh`).

`--v` is the bar's share of the plot height, 0 to 1. Keep the tallest bar near `.8`: the spring overshoots by about a fifth, and the label needs room above it. `--to` is the whole number the label counts to.

## Variants and options

| Class or property | Where | What it does |
|---|---|---|
| `.bars` | List | Vertical bars. Height from `--bars-h` (200px), gap from `--bar-gap` (8px) |
| `.bars-h` | List, with `.bars` | Horizontal bars; the label rides the end of the bar. Thickness from `--bar-thick` (14px) |
| `--v`, `--to` | Each `li` | Bar length (0 to 1) and the number to count to |
| `--bar-color` | List or `li` | Fill colour, `currentColor` by default. Mark one key bar, not many |
| `--bars-delay` | List | Holds the whole list, to start a second chart after the first |
| `--i` | Each `li` | Stagger step. Set for you where `sibling-index()` exists; set it by hand for other browsers |
| `.bar-mark` | Inside a `.bars-plot` wrapper, after the list | A dashed rule across the plot at its own `--v`, drawn after the bars land (`--mark-delay`, 1400ms) |

## Do

- Mark the one bar the reader should look at: a colour on its fill and a larger number.
- Start a second chart with `--bars-delay` so the eye finishes the first one.

## Do not

- Count decimals or thousands with this: a CSS counter is a plain integer with no separators. Use the odometer pattern for money and large numbers.
- Put the spring on a bar that fills the plot: the overshoot will cross the top edge.

## Reduced motion

Bars, labels and the rule show at their final size and value with no animation. The real numbers are in the markup the whole time; the drawn counter carries an empty alt text, so screen readers read each value once.
