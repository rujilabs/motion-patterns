# Curve signature

Use when: someone signs a form on screen, such as a consent form at a clinic or a delivery receipt, and the signature should look written, not traced.

A canvas signature pad with ink that behaves like a pen. Every pointer sample is used, coalesced ones included, so a fast flick stays round. The points are joined by quadratic curves through their midpoints, and the width follows the pen speed through a low-pass filter: a fast stroke runs thin, a slow turn pools wide, and the change between them is gradual, the way pressure behaves. A stylus with real pressure adds it on top. The ink is stamped as small round dabs every half pixel, so the width can change along one curve. Clear rewinds the pen: the ink un-draws in reverse stroke order, newest stroke first, each from its end back to its start, faster for a long signature and never longer than 1.1 seconds.

[Live demo](https://motion.rujilabs.com/patterns/curve-signature/) · [style.css](style.css) · [signature.js](signature.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="curve-signature/style.css">
<script src="curve-signature/signature.js" defer></script>

<div class="curve-signature" role="img" aria-label="Signature pad, empty" aria-describedby="sig-hint"></div>
<p id="sig-hint">Patient signature. Sign with your finger, a pen or the mouse.</p>
<button type="button" id="clear">Clear</button>
```

Give the pad a height. Draw the signing line behind it with a background, so it never ends up in the exported image.

```js
pad.addEventListener("sign", (e) => submit.disabled = e.detail.length < 120); // px of ink
clear.addEventListener("click", () => pad.clear().then(() => submit.disabled = true));
form.signature.value = pad.toDataURL();   // a PNG of the ink only
save(pad.strokes);                        // [[x, y, ms], ...] per stroke, to redraw later
pad.fromStrokes(saved);                   // redraws them with the same pen
```

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-min-width` | Ink width in px at full speed | `0.9` |
| `data-max-width` | Ink width in px with the pen at rest | `3.6` |
| `--sig-ink` | Ink colour, read on every paint, so a dark mode pair works | Ballpoint blue |
| `el.clear()` | Un-draws, then fires `clear`. Returns a Promise | |
| `el.isEmpty()`, `el.inkLength()` | No ink yet; px of ink drawn | |

## Do

- Offer a typed name as well. A canvas cannot be signed with a keyboard, and some people cannot draw.
- Ask for a minimum amount of ink before submit, so a single tap is not a signature.

## Do not

- Stretch the canvas with CSS after drawing. The script sizes it to the element and the screen's pixel ratio, and redraws on resize.
- Smooth so hard that the corners go. A signature is recognised by its sharp turns.

## Reduced motion

Clear removes the ink at once, with no rewind. Drawing is the input itself, so the pad still inks as you write.
