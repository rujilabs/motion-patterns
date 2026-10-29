# Rotary knob

Use when: someone sets one value in a range by feel, such as the temperature on a thermostat.

A knob on an arc scale, with a detent at every step. Drag around the centre to turn it, the way you turn a real one. While you drag, the cap is pulled into the nearest notch and jumps to the next one past the midpoint, so each step is felt; let go and it springs into its notch. The stops at both ends are hard. The knurled grip and the index line turn with the cap, but the highlight and the contact shadow do not, because the light in the room stays where it is. It is an ARIA slider, with the arrow keys, Page Up, Page Down, Home and End.

[Live demo](https://motion.rujilabs.com/patterns/form-rotary-knob/) · [style.css](style.css) · [knob.js](knob.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="form-rotary-knob/style.css">
<script src="form-rotary-knob/knob.js" defer></script>

<div class="knob" role="slider" tabindex="0" aria-label="Set temperature"
     data-min="16" data-max="30" data-step="0.5" data-major="2" data-value="24" data-unit=" degrees Celsius">
  Set to 24.0 °C
</div>
```

`knob.js` builds the scale and the cap inside the element and keeps `aria-valuenow` and `aria-valuetext` up to date. The text inside is what shows without the script. Read the value from `el.value`:

```js
knob.addEventListener("input", () => show(knob.value));   // every notch
knob.addEventListener("change", () => save(knob.value));  // on release or key press
knob.setValue(22.5);                                       // turn it from code
```

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-min`, `data-max` | The two stops | Required |
| `data-step` | One detent | `1` |
| `data-major` | Every how many units a long tick and a number go | Two steps |
| `data-value` | Starting value | Required |
| `data-unit` | Added to the value for screen readers, with its leading space | None |
| `--knob-size` | Dial size, scale included | `220px` |
| `--knob-cap` | Cap size as a share of the dial | `52%` |
| `--knob-body`, `--knob-mark` | Cap and index line colours | Graphite, off white |
| `--knob-on`, `--knob-rest`, `--knob-ink` | Filled scale, empty scale, numbers | Blue, grey, near black |

The scale always sweeps 270 degrees, centred on 12 o'clock. Keys: arrows one step, Page Up and Page Down one major step, Home and End the stops.

## Do

- Keep the steps coarse enough to feel: 20 to 40 detents across the sweep.
- Show the value large next to the knob. The knob is for setting, not for reading.

## Do not

- Use it for a value people type exactly, such as a price. That is a number field.
- Add mouse-wheel turning on a page that scrolls. A knob that steals the scroll is a trap.

## Reduced motion

The cap goes straight into each notch while you drag, with no pull between notches and no spring when you let go or press a key.

## See also

[`range-slider`](../range-slider/), the straight version of the same job.
