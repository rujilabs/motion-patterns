# Stroke fill text

Outlined words that fill with ink from left to right when their link is hovered or focused, and drain again when it is left. Made for a list of big names where only one is in play at a time: classes, menu sections, projects.

[Live demo](https://motion.rujilabs.com/patterns/stroke-fill-text/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="stroke-fill-text/style.css">

<a class="sf-host" href="#spin">
  <span class="sf">Spin Ride</span>
  <span>7:30 am, Coach Mei Ling, 3 of 22 left</span>
</a>
```

No script. The outline uses the text colour, and the fill is a background clipped to the letters, so the word stays real text that screen readers and search read as written. A tap focuses the link on touch screens, which fills it too. `aria-current` on the host keeps it filled, for the page you are on.

## Options

| Name | What it does | Default |
|---|---|---|
| `--sf-fill` | Ink colour of the fill | the text colour |
| `--sf-stroke` | Outline width | `1.5px` |
| `.sf-rise` on `.sf` or a parent | Fill from the bottom up instead of left to right | |
| `--dur-base` | How long the fill takes | token, `600ms` |

## Do

- Use a heavy weight at a large size (700 to 800, 28 px and up). Thin outlines on small text are hard to read.
- Keep the details (time, price) in plain solid text next to the word.

## Do not

- Do not outline a whole paragraph. Outlined text is for a few big words.
- Do not make the fill the only sign of focus: keep a focus ring on the host.

## Reduced motion

The word fills at once on hover or focus, with no sweep. In forced colours mode the words are plain solid text.
