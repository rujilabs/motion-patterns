# Text scramble

Letters flicker through random characters, then settle on the real text one by one from left to right. It suits codes, references and short labels that a system has just produced.

[Live demo](https://motion.rujilabs.com/patterns/text-scramble/) · [style.css](style.css) · [scramble.js](scramble.js)

## Use

```html
<link rel="stylesheet" href="text-scramble/style.css">
<script src="text-scramble/scramble.js"></script>

<!-- scrambles once on load -->
<output data-scramble>KT7Q-4MRW-29HX</output>

<!-- a button that steps the target through a list -->
<output id="code" data-scramble data-scramble-list="KT7Q-4MRW-29HX|PN3V-8LCA-H6ZE">KT7Q-4MRW-29HX</output>
<button type="button" data-scramble-next="code">New code</button>
```

From your own script: `scramble(element, "NEW TEXT")`.

## Options

| Attribute or property | What it does |
|---|---|
| `data-scramble` | Scrambles this element on load. Plain text only: markup inside it is flattened |
| `data-scramble-dur` | Milliseconds until the first letter settles, default 700 |
| `data-scramble-stagger` | Milliseconds between one letter settling and the next, default 45 |
| `data-scramble-delay` | Milliseconds before it starts |
| `data-scramble-chars` | The pool of random characters, default capitals and digits without look-alikes (no I, O, 0, 1) |
| `data-scramble-list` + `data-scramble-next` | A list of texts on the target, separated by `\|`, and a button that moves to the next one |
| `--scramble-color` | Colour of the flickering glyphs, default the text colour |

Spaces, dashes and stops never scramble, so the shape of the text shows from the first frame. Each real letter keeps its place while a random glyph is painted over it, so the line never changes width. Each letter runs a Web Animations clock named `scramble`; the glyph is read from it, so pausing or scrubbing that animation freezes the flicker too.

## Do

- Keep it to one short line: a code, a reference number, a status word.
- Keep the whole run under about a second and a half. It should read as "just made", not as a show.

## Do not

- Scramble a heading or body text. People try to read it and cannot.
- Scramble on every update of a live value. Use it when the value is new, not when it ticks.

## Reduced motion

Nothing is split or scrambled: the text is there at once.

## Accessibility

A visually hidden copy carries the whole text for screen readers; the flickering letters are `aria-hidden`. Without the script, the text simply shows.
