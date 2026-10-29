# Drum time picker

Use when: a booking form needs a start time, and the hour and minute should snap to the slots you actually take.

Hour, minute and am or pm wheels on real 3D cylinders. Each value is a face placed on the drum with `rotateX(angle) translateZ(radius)`, and the radius is worked out from the row height, so the rows meet edge to edge and squeeze together as they turn away. Each face dims with the cosine of its angle. Flick a wheel and it keeps the speed your finger gave it, slows down like a wheel with drag, and lands exactly on a row.

[Live demo](https://motion.rujilabs.com/patterns/drum-time-picker/) · [style.css](style.css) · [drum-time-picker.js](drum-time-picker.js)

## Use

```html
<link rel="stylesheet" href="drum-time-picker/style.css">
<script src="play.js"></script>
<script src="drum-time-picker/drum-time-picker.js" defer></script>

<div class="drum" role="spinbutton" tabindex="0" aria-label="Minutes"
     aria-valuemin="0" aria-valuemax="45" data-loop>
  <ol class="drum-list">
    <li data-n="0">00</li><li data-n="15">15</li><li class="is-on" data-n="30">30</li><li data-n="45">45</li>
  </ol>
</div>
```

```js
const minutes = document.querySelector(".drum");
minutes.addEventListener("input", () => preview(minutes.drum.centre)); // a new value passes the centre
minutes.addEventListener("change", () => save(minutes.drum.index));    // the wheel came to rest
minutes.drum.set(2);                                                   // turn to the third value, the short way round
```

The script builds the cylinder and hides the list. Without the script, the list stays as a short scroll-snap column that still picks.

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-loop` | The values repeat, like hours and minutes. Without it the wheel stops at both ends, with a rubber band | Off |
| `data-step` | Degrees between rows. Smaller is a bigger, flatter drum | `20` |
| `li.is-on` | The starting value | The first |
| `li[data-n]` | The number for `aria-valuenow` | The position |
| `li[data-say]` | What a screen reader hears, if the text is not enough | The text |
| `--drum-row` | Row height. The radius follows from it | `40px` |
| `--drum-band` | Colour of the selection band. `transparent` to draw one band across several wheels yourself | 7% of the text colour |

| Input | Does |
|---|---|
| Drag, flick | Follows the finger one row per row height, then glides on and lands on a row |
| Tap a row | Turns that row to the centre |
| Mouse wheel | One row per notch. A trackpad scrolls freely, then snaps |
| Arrow Up or Down | Next or previous value |
| Page Up or Down, Home, End | Four rows, the first value, the last value |

## Do

- Use it where the choices are few and ordered: hours, 15 minute slots, am or pm, a quantity up to 20.
- Tell people at once what the value means. The demo checks the slot against the clinic's day on every `input`, while the wheel is still turning.
- Keep `touch-action: none` on the drum only, so the rest of the page still scrolls.

## Do not

- Use it for a long list such as countries or years of birth. A field you can type in is faster.
- Put several wheels with the same label next to each other. Each spinbutton needs its own `aria-label`.

## Reduced motion

A flick, key press or tap puts the wheel on its new row at once, with no glide and no snap. A drag still follows the finger, since that is direct control.
