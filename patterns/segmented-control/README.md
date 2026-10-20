# Segmented control

Radio buttons in a row with one pill that slides to the chosen option. CSS only: `:has()` reads which option is checked and how many options there are (2 to 6), and the pill moves by whole widths of one option.

[Live demo](https://motion.rujilabs.com/patterns/segmented-control/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="segmented-control/style.css">

<div class="seg" role="radiogroup" aria-label="Period">
  <label><input type="radio" name="period" value="day">Day</label>
  <label><input type="radio" name="period" value="week" checked>Week</label>
  <label><input type="radio" name="period" value="month">Month</label>
  <span class="seg-pill" aria-hidden="true"></span>
</div>
```

Arrow keys move between options, as they do for any radio group.

## Options

| Property | What it does | Default |
|---|---|---|
| `--seg-bg` | The groove behind the options | `#eef2f7` |
| `--seg-pill`, `--seg-line` | Pill fill and its 1px edge | `#fff`, `#d9dfe8` |
| `--seg-ink`, `--seg-mute` | Label colour when chosen and when not | `#1e2229`, `#636b78` |
| `--seg-pad` | Gap between the groove and the pill | `3px` |

## Do

- Keep labels short and close in length: every option gets the same width.
- Use it to switch the view of one thing (a period, a unit, a layout).

## Do not

- Use it for more than 6 options, or for actions. Those are a select and buttons.
- Let it wrap onto two lines. At narrow widths shorten the labels instead.

## Reduced motion

The pill jumps to the chosen option.

## Browser support

Needs `:has()` (every current browser). Without it the pill stays on the first option, so use it where that is acceptable or add a checked style of your own.
