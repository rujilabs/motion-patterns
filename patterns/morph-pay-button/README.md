# Pay button morph

Use when: a pay or submit button has to wait for an answer from a bank or a server, and the person must see that it is working, that it worked, or that it did not.

The button turns into its own progress. Press it and the label fades while the pill closes into a circle: the width falls to the height and the radius stays round, so the ends never flatten on the way. The edge of that circle becomes the spinner track and an arc runs round it while the bank answers. A yes runs the arc on into a full ring, fills the face and draws a tick. A no closes the ring in the warning colour, draws an exclamation mark, shakes the circle side to side in smaller and smaller swings, and opens it back into the pill. When the bank answers, the arc does not snap back to the top: it coasts on from wherever it was.

[Live demo](https://motion.rujilabs.com/patterns/morph-pay-button/) · [style.css](style.css) · [morph-pay-button.js](morph-pay-button.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="morph-pay-button/style.css">
<script src="morph-pay-button/morph-pay-button.js" defer></script>

<button class="pay-morph" type="button"
        data-label-busy="Paying RM 86.40, please wait" data-label-done="Paid RM 86.40" data-label-fail="Payment declined">
  <span class="pay-label">Pay RM 86.40</span>
  <svg class="pay-icon" viewBox="0 0 48 48" aria-hidden="true">
    <circle class="pay-arc" cx="24" cy="24" r="22.75" pathLength="100"/>
    <path class="pay-tick" d="M15 24.5 L21.5 31 L33.5 18" pathLength="100"/>
    <path class="pay-bang" d="M24 14 L24 27 M24 33.5 L24 33.6" pathLength="100"/>
  </svg>
</button>
```

Hand it the promise of your payment call:

```js
button.addEventListener("click", function () {
  PayMorph.run(button, fetch("/pay", { method: "POST" }).then(function (r) {
    if (!r.ok) throw new Error("declined");
  }));
});
button.addEventListener("pay-state", function (e) {
  if (e.detail.state === "fail") status.textContent = "Your bank declined the card. No money was taken.";
});
```

## Options

| Call, attribute or property | Does | Default |
|---|---|---|
| `PayMorph.run(button, promise)` | Spinner until the promise settles, then tick or shake. Returns a promise of `true` (paid) or `false` | |
| `PayMorph.reset(button)` | Opens a finished button back into the pill | |
| `pay-state` event | Fires on every change with `detail.state`: `idle`, `busy`, `done`, `fail` | |
| `data-label-busy`, `data-label-done`, `data-label-fail` | The accessible name in each state. Idle uses the button text | None |
| `--pay-h` | Button height, which is also the circle size | `52px` |
| `--pay-bg`, `--pay-ink` | Face and text when idle and when paid | Deep green, white |
| `--pay-paper`, `--pay-track` | Face and ring while busy | White, pale green |
| `--pay-fail` | Ring and mark when declined | Brick red |

The busy state lasts at least 0.9 s even when the answer is instant, so the spinner never flashes.

## Do

- Put the button in a flex row with `justify-content: center`, so the circle closes to the middle of where the pill was.
- Keep the amount on the button. The person sees what they are paying at the moment they press.
- Write the outcome in a status line next to it (`role="status"`). The tick and the shake are fast; the words stay.

## Do not

- Disable the button with `disabled` while it is busy. It drops keyboard focus; the script uses `aria-disabled` and ignores presses instead, so a double tap never pays twice.
- Use it for actions that answer in under 200 ms, like adding to a cart. The morph would take longer than the work.
- Leave a declined button as a red circle. It has to open back into a button the person can press again.

## Reduced motion

Each state shows at once: the circle, a still arc, the tick or the mark. No width change, no spin, no shake.
