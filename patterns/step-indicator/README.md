# Step indicator

A row of steps joined by a line, for checkouts and setup flows. Moving on, the step you leave ticks at once, then the line fills to the next step and that step lights up as the line arrives. Moving back runs the same beats the other way.

[Live demo](https://motion.rujilabs.com/patterns/step-indicator/) · [style.css](style.css) · [steps.js](steps.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="step-indicator/style.css">
<script src="step-indicator/steps.js"></script>

<ol class="steps" aria-label="Checkout progress">
  <li class="steps-track" aria-hidden="true"><span class="steps-fill"></span></li>
  <li class="step" aria-current="step">
    <span class="step-dot" aria-hidden="true">
      <span class="step-num">1</span>
      <svg class="step-tick" viewBox="0 0 16 16"><path pathLength="1" d="M3.5 8.5 L6.8 11.6 L12.6 4.6"/></svg>
    </span>
    <span>Bag</span>
  </li>
  <!-- one .step per step -->
</ol>
```

```js
steps.go(list, 2);  // step 3 is current, steps 1 and 2 are done
steps.go(list, 4);  // with four steps: all done
```

On load the script reads the step marked `aria-current="step"`.

## Options

| Property | What it does |
|---|---|
| `color` on `.steps` | The fill, the done dots and the ring |
| `--steps-line` | The empty line and the waiting dots. Default `#d9dfe8` |
| `--steps-bg` | The inside of a waiting dot and the tick colour. Set it to your surface colour |
| `--steps-dot` | Dot size. Default `28px`; the line follows it |
| `--steps-p`, `--steps-n` | Set by the script: progress from 0 to 1 and the number of steps |

## Do

- Keep the labels to one word each. At 375px four steps get about 80px apiece.
- Let the page under it change too (the demo swaps the panel text). The indicator confirms the move; it is not the move.

## Do not

- Use it for more than five or six steps. Show "Step 3 of 9" and a plain bar instead.
- Let readers click ahead to steps they have not reached.

## Reduced motion

The line, the dots and the ticks change at once.
