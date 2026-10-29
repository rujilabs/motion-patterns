# Gear sale countdown

Use when: a flash sale or a ticket hold has a hard end time, and the countdown should feel like a clock running out.

A countdown ticked by a clock escapement, one beat per second. The pendulum and anchor swing across as one piece, a pallet lets go of a tooth, and the 30-tooth escape wheel drops half a tooth (6 degrees, so it turns once a minute like the seconds wheel of a real clock) and recoils onto the other pallet. The digits change on the drop, not on the swing. At zero the anchor stops and the wheel stays locked.

[Live demo](https://motion.rujilabs.com/patterns/gear-sale-countdown/) · [style.css](style.css) · [gear-sale-countdown.js](gear-sale-countdown.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="gear-sale-countdown/style.css">
<script src="gear-sale-countdown/gear-sale-countdown.js" defer></script>

<div class="gear-sale-countdown" data-left="909">
  <svg class="gsc-works" aria-hidden="true"></svg>
  <p class="gsc-time" data-gsc-time>00:15:09</p>
</div>
```

It starts ticking at once. It moves for more than 5 seconds, so give people a pause:

```js
box.gscPause();  box.gscPlay();  box.gscSet(10);
box.addEventListener("gscend", function () { /* close the sale */ });
```

## Options

| Attribute, method or event | Does | Default |
|---|---|---|
| `data-left` | Seconds left | `0` |
| `data-manual` | Do not start on load; call `gscPlay()` yourself | off |
| `gscPlay()`, `gscPause()` | Start and stop the beat | |
| `gscSet(seconds)` | Jump to a new time left | |
| `gsctick` | Fires on each drop with `detail.left` | |
| `gscend` | Fires at zero; the element gets `.is-ended` | |
| `--gsc-wheel`, `--gsc-anchor`, `--gsc-rod`, `--gsc-bob`, `--gsc-pin` | Colours | |

The beat corrects its own drift against `performance.now()`, but it counts whole seconds from when it starts. For a real sale, set `data-left` from the server's end time when the page loads.

## Do

- Keep the plain digits in the markup. They are what screen readers and the no-script page show.
- Show the pause control near the clock.

## Do not

- Trust the browser clock for the end of a real sale. The server decides when it ends.
- Put two on one page. Two pendulums out of step look broken.

## Reduced motion

No swing, no drop and no recoil. The digits and the wheel still step once a second, because the time left is the content.
