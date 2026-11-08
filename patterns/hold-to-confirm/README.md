# Hold to confirm

Use when: removing something saved that is a nuisance to set up again, such as a payment card in an e-wallet.

A pill button you press and hold. While you hold, a fill sweeps across it and a ring closes around the icon at a steady pace, so you can see how long is left. At the end the button pops, the ring turns into a tick and it fires `confirm`. Let go early and the fill drains back while the button springs out of its press, and the status line says how far you got. A hold that turns into a scroll on a phone lets go too, so nobody removes a card by scrolling past it.

[Live demo](https://motion.rujilabs.com/patterns/hold-to-confirm/) · [style.css](style.css) · [hold.js](hold.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="hold-to-confirm/style.css">
<script src="hold-to-confirm/hold.js" defer></script>

<button class="hold" type="button" data-hold="1500" data-status="status" data-done="Card removed" aria-describedby="help">
  <span class="hold-fill" aria-hidden="true"></span>
  <svg class="hold-ring" viewBox="0 0 20 20" aria-hidden="true">
    <circle class="hold-track" cx="10" cy="10" r="8" transform="rotate(-90 10 10)"/>
    <circle class="hold-arc" cx="10" cy="10" r="8" pathLength="1" transform="rotate(-90 10 10)"/>
    <path class="hold-check" d="M6 10.4l2.7 2.7L14.2 7.4" pathLength="1"/>
  </svg>
  <span class="hold-label">Hold to remove card</span>
</button>
<p id="help">Press and hold for 1.5 seconds, or hold Space or Enter.</p>
<p id="status" role="status"></p>
```

```js
button.addEventListener("confirm", () => removeCard());
button.reset(); // back to the start
```

## How each person confirms

| Input | What it takes |
|---|---|
| Mouse, pen, touch | Press and hold. Sliding off the button or into a scroll lets go |
| Keyboard | Hold Space or Enter |
| A screen reader or switch click | Two steps: the first asks "Press again within 5 seconds to confirm", the second confirms |

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-hold` | How long to hold, in milliseconds | `1500` |
| `data-done` | Button text once it is done | `Done` |
| `data-status` | id of the live text that says each step | None |
| `--hold-ink`, `--hold-base`, `--hold-fill` | Text and ring, button, fill | Reds |

## Do

- Keep the hold between 1 and 2 seconds and say how long in the help text.
- Say what happened after it, in words, and offer a way back where you can.

## Do not

- Use it for actions people do many times a day. A hold is a speed bump.
- Drop the keyboard and two-click paths. Some people cannot hold anything.

## Reduced motion

The fill still grows while you hold, because it is the only way to see how long is left. There is no press spring, no pop at the end, and letting go clears the fill at once.
