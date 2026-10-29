# Tile keypad PIN

Use when: someone confirms a payment or unlocks an app with a PIN, and the keypad should feel like real keys.

A PIN keypad built from key tiles that press in 3D. Each key stands on its own lower edge. Press it and it tips toward the exact point you touched, sinks onto its edge and darkens a shade; let go and it springs back up. The keyboard presses it straight down. Each digit fills a dot with a small pop. A wrong code turns the dots red and shakes them no, each swing smaller than the last, then clears them; a right code turns them green and they hop one after another, left to right. The digits are never shown, never written into the page, and never read out: the status line only says how many are in and what happened.

[Live demo](https://motion.rujilabs.com/patterns/tile-keypad-pin/) · [style.css](style.css) · [tile-keypad-pin.js](tile-keypad-pin.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="tile-keypad-pin/style.css">
<script src="tile-keypad-pin/tile-keypad-pin.js" defer></script>

<div class="pin-pad" data-length="6" data-status="pin-status">
  <div class="pin-dots" role="img" aria-label="PIN, 0 of 6 digits entered"></div>
  <div class="pin-keys" role="group" aria-label="PIN keypad">
    <button type="button" class="pin-key" data-key="1">1</button>
    <!-- 2 to 9 -->
    <span aria-hidden="true"></span>
    <button type="button" class="pin-key" data-key="0">0</button>
    <button type="button" class="pin-key" data-key="del" aria-label="Delete last digit">...</button>
  </div>
  <p id="pin-status" role="status"></p>
</div>
```

```js
pad.addEventListener("pinentry", async (e) => {
  const ok = await checkWithTheBank(e.detail.pin);
  pad.pinResult(ok, ok ? "PIN accepted." : "Wrong PIN. 2 tries left.");
});
```

The keys are real buttons, so Tab, Enter and Space work. While focus is anywhere in the pad, the number keys and Backspace type too, and press the matching tile. The pad holds the digits in memory only and hands them over once, in `pinentry`. Call `pad.pinReset()` to start again.

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-length` | Digits in the PIN | `6` |
| `data-status` | Id of the `role="status"` line the pad writes to | None |
| `--pin-w`, `--pin-h` | Key size | `72px`, `54px` |
| `--pin-depth` | How tall a key stands on its edge | `4px` |
| `--pin-key`, `--pin-edge`, `--pin-ink`, `--pin-dot` | Key face, key edge, numbers, dots | White, grey green, deep green |
| `--pin-ok`, `--pin-wrong`, `--pin-ring` | Right code, wrong code, focus ring | Green, red, green |

## Do

- Say what happened in words as well as with the dots: "Wrong PIN. 2 tries left."
- Keep the delete key. People mistype on glass.

## Do not

- Show the last digit for a moment, as some phone keyboards do. A PIN pad never shows a digit.
- Shuffle the keys. People find digits by place, and a moving layout makes them slow and wrong.

## Reduced motion

Keys still sink while held, with no tilt or spring. Dots fill, go red or green at once, and nothing shakes or hops. The status line says the same things.

## See also

[form-keycap](../form-keycap/) is one keyboard key for a shortcut hint; this is a full keypad with tilt toward the touch point and a PIN flow.
