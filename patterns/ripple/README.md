# Ripple

A press sends a soft wave out from the exact point that was touched. The wave is sized to reach the farthest corner, grows fast and fades slower, so the colour is still there when it reaches the edges.

[Live demo](https://motion.rujilabs.com/patterns/ripple/) · [style.css](style.css) · [ripple.js](ripple.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="ripple/style.css">
<script src="ripple/ripple.js"></script>

<button class="ripple" type="button">Pay RM 42.00</button>
```

It works on buttons, links and labels around radios or checkboxes. The script listens once on the document, so elements added later ripple too.

## Options

| Class or property | What it does |
|---|---|
| `.ripple` | Clips the wave to the element's shape and keeps it behind the label |
| `--ripple-color` | The wave colour. Default `currentColor`, the text colour, which suits both light and dark buttons |
| `--ripple-strength` | Opacity of the wave at its strongest. Default `.18`; raise to about `.2` on dark buttons |

The wave starts on `pointerdown`, not on `click`, so it answers the finger at once instead of after it lifts. A keyboard click (Enter or Space) has no point, so its wave starts from the centre.

## Do

- Pair it with a real state change: a selected row, a new screen, a sent form. The ripple confirms the press; it does not replace the result.
- Keep `overflow: hidden` on the element, which `.ripple` sets, or the wave spills outside the corners.

## Do not

- Ripple big cards or whole panels. On a wide surface the wave takes too long to cross and looks slow.
- Stack it with a second press effect such as a scale. One answer per press.

## Reduced motion

No wave is added. The element's own pressed and selected styles still show.
