# Vignette

The edges of a picture darken toward the corners and the eye settles on the middle. The amount fades in as the picture comes into view.

[Live demo](https://motion.rujilabs.com/patterns/vignette/) · [style.css](style.css)

## Use

Put the class on the box that holds your image, or on a whole section.

```html
<figure class="look-vignette vignette-in" data-play>
  <img src="lake.jpg" alt="A boat on the lake at first light">
</figure>
```

The overlay is the box's `::after`, so the box cannot be an `img` itself.

## Options

| Class or property | What it does |
|---|---|
| `.look-vignette` | The look, at rest |
| `.vignette-in` | With `.look-vignette`: starts clear and fades the vignette in when `play.js` adds `.go` to it or an ancestor |
| `.vignette-light` | A white falloff for bright, high key pictures |
| `--vignette` | How dark the corners get, `0` to `1`. Default `.6` |
| `--vignette-inner` | How much of the middle stays clear. Default `38%` |
| `--vignette-color` | Colour of the falloff. Default black |
| `--vignette-delay` | Wait before it fades in. Default `.3s` |

## Do

- Keep it subtle. If someone notices the dark corners before the subject, turn `--vignette` down.
- Centre the subject, or move the clear area with your own gradient position. A vignette pulls the eye to where it is clear.

## Do not

- Use it on pictures with something important in a corner, like a logo or a caption.
- Stack it with a dark overlay for text legibility. Pick one.

## Reduced motion

The vignette is there from the start; nothing fades.

## Without JavaScript

`.vignette-in` shows the finished vignette when `play.js` is not loaded.
