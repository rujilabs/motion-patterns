# Range slider

A native range input with a filled track and a value bubble that rides above the thumb. Hold the thumb (or move it with the keyboard) and the bubble pops up on the spring curve while the thumb swells; let go and both settle back.

[Live demo](https://motion.rujilabs.com/patterns/range-slider/) · [style.css](style.css) · [range.js](range.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="range-slider/style.css">
<script src="range-slider/range.js" defer></script>

<label for="price">Most per night</label>
<div class="range">
  <input id="price" type="range" min="60" max="400" step="10" value="220" data-prefix="RM ">
  <output class="range-bubble" for="price">RM 220</output>
</div>
```

Write the starting value into the bubble yourself, so it reads right before the script runs.

## Options

| Attribute or property | What it does | Default |
|---|---|---|
| `data-prefix`, `data-suffix` on the input | Text around the number in the bubble | none |
| `--range-fill`, `--range-rest` | Track colour before and after the thumb | `#3d7bf2`, `#d9dfe8` |
| `--range-knob`, `--range-on-fill` | Thumb fill and the bubble's text colour | `#fff`, `#fff` |
| `--range-thumb`, `--range-h` | Thumb size and track height | `22px`, `6px` |
| `.is-held` | Added by `range.js` while a pointer holds the thumb | |

The bubble follows the thumb with no delay. Only its pop is animated, so it never lags behind your finger.

## Do

- Keep a visible label and the two ends of the scale. The bubble shows only the current value.
- Round the value with `step`, so the bubble does not flicker through decimals.

## Do not

- Animate the bubble's position: a bubble that trails the thumb feels broken.
- Use a slider when people need an exact number. Give them a text field next to it.

## Reduced motion

The bubble sits at full size above the thumb and never pops; the thumb does not swell.
