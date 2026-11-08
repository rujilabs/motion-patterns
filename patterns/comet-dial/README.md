# Comet dial

Use when: someone sets and runs a countdown by turning a dial, such as an oven or kitchen timer.

A round timer dial, 0 to 60 minutes. The time left is an arc from 0 round to a bright comet head on the ring. Turn the dial and the head races round with a tail behind it that stretches with its speed; let go and it settles on the nearest minute. Press Start and the head creeps back toward 0 as it counts down, its tail lying over the time already gone and sparks peeling off it, so a running timer reads as alive from across a kitchen. At zero it bursts and says Done. You turn it the way you turn a real knob: it follows the change in your finger's angle, so grabbing it never makes the value jump. It is an ARIA slider, with the arrow keys, Page Up, Page Down, Home and End.

[Live demo](https://motion.rujilabs.com/patterns/comet-dial/) · [style.css](style.css) · [comet-dial.js](comet-dial.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="comet-dial/style.css">
<script src="comet-dial/comet-dial.js" defer></script>

<div class="comet-dial" id="dial" role="slider" tabindex="0" aria-label="Oven timer, in minutes"
     aria-valuemin="0" aria-valuemax="60" aria-valuenow="18" aria-valuetext="18 minutes left"
     data-value="18" data-max="60">
  <canvas aria-hidden="true"></canvas>
  <span class="cd-read" aria-hidden="true"><span class="cd-time">18:00</span> left</span>
</div>
<button type="button" id="start" aria-pressed="false">Start</button>
<script>
  start.addEventListener("click", function () { dial.dial.running() ? dial.dial.pause() : dial.dial.start(); });
  dial.addEventListener("state", function () { start.setAttribute("aria-pressed", dial.dial.running()); });
</script>
```

`el.dial` has `start()`, `pause()`, `running()`, `left()` (seconds) and `speed(n)` (run n times faster, for a demo). The dial fires `change` when someone sets it, `state` on any change of value or running, and `done` at zero. The countdown clock is a Web Animation on the canvas, so it keeps time in a background tab even though the drawing stops there. Give the page a Start / Pause button with `aria-pressed`: the countdown moves on its own for minutes.

## Options

Set these on `.comet-dial`.

| Property | Does | Default |
|---|---|---|
| `--cd-ink` | Comet, arc and focus ring | Oven orange `#ff8a3d` |
| `--cd-face` | Dial face | `#1c1e23` |
| `--cd-track`, `--cd-tick` | Ring and minute marks | Greys |
| `--cd-text` | Comet core and readout | `#f4f1ec` |
| `--cd-p` | Arc share for the still dial without the script, 0 to 1 | `0` |
| `data-max` | Minutes round the dial | `60` |

## Do

- Show the time left in large text in the middle, and say the finish time in words beside it ("out at 3:50 pm").
- Keep the dial dark in both colour schemes. It is an appliance, and the comet needs the dark to glow.

## Do not

- Use it for seconds-long waits. Over a minute or more the slow comet reads as calm; over seconds it is a spinner.
- Put two running comet dials next to each other. Two moving tails compete for the eye.

## Reduced motion

No tail, sparks or burst, and the head goes straight to each value. The dial redraws twice a second while it counts, so the time left stays right. Without the script the CSS draws a still dial with the arc at `--cd-p`.

## See also

[`form-rotary-knob`](../form-rotary-knob/), a knob with detents for one value in a range.
