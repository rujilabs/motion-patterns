# Stepper

Minus and plus buttons around a number that rolls in the direction of the change: going up, the old digit leaves upward and the new one rises in from below; going down, the reverse. Only the digits that change roll, and the same roll works for any number on the page, such as a total.

[Live demo](https://motion.rujilabs.com/patterns/stepper/) · [style.css](style.css) · [stepper.js](stepper.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="stepper/style.css">
<script src="stepper/stepper.js" defer></script>

<div class="stepper" data-stepper data-min="1" data-max="12" role="group" aria-label="Adults">
  <button type="button" class="stepper-btn" data-step="-1" aria-label="Fewer">-</button>
  <output class="roll" aria-live="polite">2</output>
  <button type="button" class="stepper-btn" data-step="1" aria-label="More">+</button>
</div>
```

Roll any other number with the same function:

```js
rollTo(document.getElementById("total"), 160, "up");
```

## Options

| Attribute, event or property | What it does | Default |
|---|---|---|
| `data-min`, `data-max` | Bounds; the button at a bound is disabled | none |
| `data-step` on a button | How much one press adds; negative for minus | |
| `stepper:change` | Fires on `[data-stepper]` with `detail.value` | |
| `--roll-dur` | Length of one roll | `--dur-base` x .6 |
| `.roll[data-dir]` | `up` or `down`, set by the script | `up` |

When the number of digits changes (9 to 10), the whole number rolls as one piece, so the new digit does not appear from nowhere.

## Do

- Use it for small counts people adjust one at a time: guests, tickets, items in a cart.
- Disable the button at a bound, so a press there does nothing instead of rolling to the same number.

## Do not

- Use it for numbers people know exactly and may want to type, such as a year or a long quantity.
- Hold a button down to auto-repeat with this roll: a fast run of rolls blurs into noise.

## Reduced motion

The number changes in place with no roll, and the buttons do not shrink when pressed.
