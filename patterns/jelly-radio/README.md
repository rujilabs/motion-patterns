# Jelly radio

Use when: someone picks one option from a short list and the choice should feel physical, such as a delivery slot.

A radio group with a single selected dot that behaves like a blob of jelly. Pick another option and the dot leaves its ring and travels to the new one on a damped spring. On the way it stretches along the direction it moves, more the faster it goes, and thins across by the same amount so it keeps its volume. It lands with a squash, overshoots a touch and wobbles still in about half a second. Arrow keys move it the same way, because the inputs are real radios.

[Live demo](https://motion.rujilabs.com/patterns/jelly-radio/) · [style.css](style.css) · [jelly-radio.js](jelly-radio.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="jelly-radio/style.css">
<script src="jelly-radio/jelly-radio.js" defer></script>

<fieldset class="jelly-radio">
  <legend>Wednesday 11 November</legend>
  <label class="jr-option">
    <input type="radio" name="slot" value="0900">
    <span class="jr-ring"></span> 9:00 to 11:00 am
  </label>
  <label class="jr-option">
    <input type="radio" name="slot" value="1630" checked>
    <span class="jr-ring"></span> 4:30 to 6:30 pm
  </label>
</fieldset>
```

Each input comes right before its `.jr-ring`. The script adds one `.jr-dot` to the group and moves it on every `change`, from wherever it is, so a quick second pick bends the flight instead of restarting it. The rows can sit in a column, a row or a grid: the stretch follows the real direction of travel.

## Options

Set these on `.jelly-radio`.

| Property | Does | Default |
|---|---|---|
| `--jr-size` | Ring size | `22px` |
| `--jr-dot` | Dot size | `12px` |
| `--jr-ink` | Dot, checked ring and focus ring colour | `#3d7bf2` |
| `--jr-line` | Ring colour when not checked | `#c3cbd6` |

In `jelly-radio.js`, `K` and `C` set the spring (stiffer and faster, or looser and wobblier).

## Do

- Keep the options close together, in one column or row. The jelly reads best over 40 to 300 px.
- Mark full options `disabled`: arrow keys skip them and the dot never lands there.

## Do not

- Use it for a long list that scrolls. The dot cannot travel to a ring that is out of view.
- Push the stretch higher for fun. Past about 1.7 times its width the dot reads as a line, not jelly.

## Reduced motion

The dot jumps straight to the new ring. No stretch, no wobble. Without the script each ring fills on its own.

## See also

[`form-check-cube`](../form-check-cube/), a checkbox that turns over like a cube.
