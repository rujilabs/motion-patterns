# Impact shake

A short shake that dies away. Each swing is smaller than the one before, so it reads as a single knock settling rather than a buzz.

[Live demo](https://motion.rujilabs.com/patterns/shake/) · [style.css](style.css) · [shake.js](shake.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="shake/style.css">
<script src="shake/shake.js"></script>

<div class="shake-x" id="pin">…</div>
<p id="msg" aria-live="polite"></p>
<button data-shake aria-controls="pin" data-shake-out="msg" data-shake-say="Wrong PIN">Unlock</button>
```

From your own code, call `shake(element)` after a failed check. It restarts the shake even if one is still running.

## Variants

| Class or attribute | What it does | Use for |
|---|---|---|
| `.shake-x` | Side to side only, about 480ms, like a head saying no | A wrong PIN, a rejected field, a refused action |
| `.shake-screen` | Both axes plus a touch of rotation, 600ms, eased out | An impact on a whole panel, such as a drop in a game |
| `--shake` | The first swing. Default `10px` (`.shake-x`) and `8px` (`.shake-screen`) | Smaller for small elements |
| `data-shake-say` + `data-shake-out` | Writes the reason into an `aria-live` element at the same moment | Every shake that reports an error |

## Do

- Always say what went wrong in words as well. The shake catches the eye; the text tells the reader.
- Shake the thing that was wrong, the PIN dots or the one field, not the whole form.

## Do not

- Use the screen shake for errors: a whole panel jumping feels like a crash.
- Make it longer or bigger to seem more serious. Past about half a second it stops reading as a "no".

## Reduced motion

`shake.js` skips the shake and the CSS drops the animation; the message still appears.
