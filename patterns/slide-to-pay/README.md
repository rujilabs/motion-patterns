# Slide to pay

Use when: paying a bill from a phone, where a stray tap in a pocket or on a crowded table must not pay.

A round knob in a pill track with "Slide to pay RM 86.40" written along it. Drag the knob to the right: a tinted fill follows it and the label fades as the knob covers it. Let go past 85 percent of the way and the knob runs to the end, the track turns green, the arrow becomes a tick and it fires `confirm`. Let go short of that and it springs back and knocks against the start. A tap on the track nudges the knob a little to the right and back, to show which way it goes.

[Live demo](https://motion.rujilabs.com/patterns/slide-to-pay/) · [style.css](style.css) · [slide.js](slide.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="slide-to-pay/style.css">
<script src="slide-to-pay/slide.js" defer></script>

<div class="slide" role="slider" tabindex="0" aria-label="Slide to pay RM 86.40" aria-describedby="help"
     aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-valuetext="Not paid"
     data-commit="0.85" data-status="status" data-done="Paid RM 86.40">
  <span class="slide-fill" aria-hidden="true"></span>
  <span class="slide-label" aria-hidden="true">Slide to pay RM 86.40</span>
  <span class="slide-knob" aria-hidden="true"><svg viewBox="0 0 24 24"><!-- copy the arrow and tick from index.html --></svg></span>
</div>
<button class="slide-alt" type="button">Pay RM 86.40</button>
<p id="help">Slide all the way, or press Enter.</p>
<p id="status" role="status"></p>
```

```js
slider.addEventListener("confirm", () => pay());
slider.reset(); // back to the start
```

Without the script the track stays hidden and the `.slide-alt` button shows instead, so the page still has a way to pay.

## How each person pays

| Input | What it takes |
|---|---|
| Mouse, pen, touch | Drag the knob to the right. A drag up or down still scrolls the page |
| Keyboard | Arrows move it in tenths. End, Enter, or arrowing to the end pays. Home goes back. Leave it short and it goes back when focus moves on |
| Screen reader | A slider that reads "Not paid", then the percent, then "Paid" |

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-commit` | How far, from 0 to 1, counts as paying when you let go | `0.85` |
| `data-done` | Track text once paid | `Done` |
| `data-status` | id of the live text to keep up to date | None |
| `--slide-h`, `--slide-pad` | Track height, gap round the knob | `60px`, `5px` |
| `--slide-track`, `--slide-fill`, `--slide-knob`, `--slide-done` | Track, fill, knob, paid colour | Grey, light blue, blue, green |

## Do

- Put the amount in the label and in the accessible name, so people know what they are agreeing to.
- Show a receipt line straight after, in words.

## Do not

- Make the commit point 100 percent. A thumb rarely gets to the very end.
- Use it on a desktop-only page where a plain button is quicker.

## Reduced motion

The knob still follows your finger, because that is the control. Let go short and it jumps home; pay and it jumps to the end. No spring, no knock and no pop on the tick.
