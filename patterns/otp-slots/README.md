# OTP slots

Use when: someone types a one-time code from an SMS, such as the 6-digit TAC a bank sends before a transfer.

Six boxes, one per digit. A caret blinks in the next empty box and the box glows, so it is plain where the next digit goes. Each digit pops up into its box. Backspace walks back one box at a time. A pasted or autofilled code fills the boxes left to right in a quick run. When the last box is filled it fires `complete`; your code then calls `reject()`, which shakes the row, shows it red and clears it, or `accept()`, which turns the boxes green with a small wave and locks them.

Under the boxes is one real `<input inputmode="numeric" autocomplete="one-time-code">`, laid over them and made invisible. It does the typing, the paste, the SMS autofill on phones and the screen reader reading. The boxes are only a picture of its value.

[Live demo](https://motion.rujilabs.com/patterns/otp-slots/) · [style.css](style.css) · [otp.js](otp.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="otp-slots/style.css">
<script src="otp-slots/otp.js" defer></script>

<div class="otp" data-status="status">
  <label for="tac">6-digit TAC</label>
  <div class="otp-box">
    <input class="otp-input" id="tac" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}" aria-describedby="status">
    <div class="otp-slots" aria-hidden="true">
      <span class="otp-slot"></span><span class="otp-slot"></span><span class="otp-slot"></span>
      <span class="otp-slot"></span><span class="otp-slot"></span><span class="otp-slot"></span>
    </div>
  </div>
</div>
<p id="status" role="status"></p>
```

```js
otp.addEventListener("complete", async (e) => {
  const ok = await checkCode(e.detail.value);
  ok ? otp.accept("Code accepted.") : otp.reject("That code is wrong. 2 tries left.");
});
```

The number of `.otp-slot` boxes sets the code length. Without the script the plain input shows, and it still takes the code.

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-status` | id of the live text that `accept()` and `reject()` write to | None |
| `--otp-on` | Caret and active box | Blue |
| `--otp-ok`, `--otp-bad` | Right and wrong code | Green, red |
| `--otp-ink`, `--otp-bg`, `--otp-line` | Digits, box fill, box border | Ink, white, grey |

## Do

- Keep the real input: autofill from an SMS is the fastest way in on a phone.
- Say how many tries are left after a wrong code, in words.

## Do not

- Build six separate inputs. Paste, autofill and screen readers all break on them.
- Clear the code while the person is still reading the error; the row stays red for a moment first.

## Reduced motion

No pop, no shake and no wave, and the caret stays lit without blinking. The red and green boxes and the status text still say what happened.
