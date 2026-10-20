# Highlighter

A marker stroke that sweeps behind words when they come into view, like someone going over the line that matters with a highlighter pen.

[Live demo](https://motion.rujilabs.com/patterns/highlighter/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="highlighter/style.css">
<script src="play.js"></script>

<p data-play>Sales were slow until <mark class="hl">evening takings doubled</mark>.</p>
```

`<mark>` is the right element: screen readers can announce it as highlighted. The pattern clears the browser's own yellow mark background.

## Options

| Class or property | What it does |
|---|---|
| `.hl` | The stroke, 75% of the line height, centred a little low. Sweeps in `--dur-slow` once `play.js` adds `.go` |
| `.hl-under` | A lower, thinner stroke under the bottom half of the words |
| `--hl-color` | Stroke colour. Default a warm yellow at 55%. Keep it translucent so the text stays sharp on top |
| `--hl-delay` | Start later, to have several marks follow each other through a paragraph |
| `--hl-h`, `--hl-y` | Stroke height and vertical position |

## How it works

The stroke is a gradient background on the inline element, grown from 0% to 100% wide. `box-decoration-break: clone` gives each line of a wrapped mark its own rounded stroke. All lines of one mark sweep at the same time; to sweep line after line, split it into several marks with delays.

## Do

- Mark one phrase per paragraph, at most. The point is that the rest is not marked.
- In dark mode use a lower alpha (the demo uses 38%) so light text stays readable.

## Do not

- Highlight whole sentences or links.
- Use the colour alone to carry meaning; the words should still make sense without it.

## Reduced motion

The stroke is there from the start, full width.
