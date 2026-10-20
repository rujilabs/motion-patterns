# Line boil

The look of hand-drawn animation: the same drawing traced three times with small differences, and the tracings take turns a few times a second, so the lines shimmer in place while the picture stays still.

[Live demo](https://motion.rujilabs.com/patterns/line-boil/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="line-boil/style.css">

<section class="boil-group">
  <svg class="boil" viewBox="0 0 200 160" role="img" aria-label="A cup of coffee">
    <g class="boil-frame">...first tracing...</g>
    <g class="boil-frame">...second tracing...</g>
    <g class="boil-frame">...third tracing...</g>
  </svg>
  <label class="boil-pause"><input type="checkbox"> Pause</label>
</section>
```

Works on any three children: `<g>` groups in an SVG, or three images or boxes in HTML, which the pattern stacks in one place.

## Options

| Class or property | What it does |
|---|---|
| `.boil` | Shows its three children in turn with hard cuts |
| `--boil-dur` | One round of all three, default `375ms`: eight drawings a second, the pace of hand-drawn animation shot "on threes" |
| `.boil-slow` | `750ms` a round, about four drawings a second, calmer for big lines |
| `.boil-pause` inside `.boil-group` | A checkbox that pauses it |

Frames 2 and 3 are hidden until the animation runs, so with no animation the first tracing shows on its own.

## Making the three tracings

- Trace the same shape three times by hand, or take one path and move each point by 1 to 2 pixels at random, a different random set for each tracing. The demo did the second.
- Keep the same number of strokes and the same order in each tracing. The eye should see one drawing that breathes, not three drawings.
- Keep the jitter small next to the stroke width: about one stroke width is plenty.

## Do

- Use it for illustrations, doodles and hand-drawn marks: an underline, an arrow, a margin note.
- Pair it with a hand-drawn or italic face, as the demo does, so the shimmer has a reason.

## Do not

- Boil large areas or long text. A whole page that shimmers is tiring.
- Boil faster than about twelve drawings a second. It stops looking drawn and starts to flicker.

## Reduced motion

Only the first tracing shows, still. The pause toggle hides.
