# Curve arc picker

Use when: people choose one of a few sizes or plans, and seeing them side by side, at their real relative size, helps them choose.

The options sit on the top of a wheel whose centre is below the picker, so they ride an arc and tilt a little with it. Swipe sideways and let go: the wheel keeps the speed you threw it with, then a spring catches the nearest option and settles it at the top with a trace of overshoot. Past either end the wheel stretches like a rubber band and pulls back. The option at the top rises off the arc, grows a little, and casts a longer, softer shadow, because it is lifted toward you. Tap any option to bring it up, or use the keys. In the demo the cakes are drawn to scale, 11 px per inch, so the size difference is real.

[Live demo](https://motion.rujilabs.com/patterns/curve-arc-picker/) · [style.css](style.css) · [arc-picker.js](arc-picker.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="curve-arc-picker/style.css">
<script src="curve-arc-picker/arc-picker.js" defer></script>

<ul class="curve-arc-picker" id="sizes" role="listbox" tabindex="0" aria-label="Cake size" aria-orientation="horizontal">
  <li class="ap-item" role="option" data-value="6">6 inch</li>
  <li class="ap-item" role="option" data-value="7">7 inch</li>
  <li class="ap-item" role="option" data-value="8" aria-selected="true">8 inch</li>
  <li class="ap-item" role="option" data-value="9">9 inch</li>
</ul>
```

It is a listbox with `aria-activedescendant`, so a screen reader hears the option at the top as the wheel turns. Read the choice from `el.value`:

```js
sizes.addEventListener("input", (e) => preview(e.detail.value));  // the option at the top changed, still turning
sizes.addEventListener("change", (e) => save(e.detail.value));    // settled
sizes.select(3);                                                  // turn to an option from code
```

## Options

| Property | Does | Default |
|---|---|---|
| `--ap-radius` | Radius of the wheel. Bigger is flatter | `420px` |
| `--ap-step` | Degrees between two options, a plain number | `15` |
| `--ap-rise` | How far the chosen option lifts off the arc | `18px` |
| `--ap-line` | Height of the line the top of the arc runs along | `50%` |
| `--ap-track` | Colour of the dashed arc | Black at 14% |
| `--ap-near`, `--ap-far` (set on each option) | 1 at the top to 0 a step away; 0 to 1 with distance. Use them for shadows and labels | |

Keys: Left and Right (or Up and Down) one option, Home and End the ends. The CSS values are read again when the picker resizes, so a media query can flatten the arc on a phone.

## Do

- Keep it to 3 to 7 options. The wheel is for a short, ordered set.
- Show the price or detail of the option at the top in text, next to the picker, and update it on `input`.

## Do not

- Use it for options with no order, such as flavours. The arc says "smaller to bigger".
- Hide the options past the ends. People need to see there is more to swipe to.

## Reduced motion

A tap or a key jumps the wheel straight to the option, with no throw and no spring. A drag still turns the wheel, because the drag is the input, and a release snaps to the nearest option at once.
