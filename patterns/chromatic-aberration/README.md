# Chromatic aberration

Red and blue fringes along dark edges, nothing in the middle and the most in the corners: the way a simple lens bends each colour by a slightly different amount. The channels split as the picture comes into view.

[Live demo](https://motion.rujilabs.com/patterns/chromatic-aberration/) · [style.css](style.css)

## Use

Lay the picture three times, one copy per channel. With an image that is three `img` tags of the same file (the browser loads it once); with SVG, three `use` of one drawing.

```html
<div class="ca ca-in" data-play role="img" aria-label="A window against the sky">
  <div class="ca-ch ca-r"><img src="window.jpg" alt=""></div>
  <div class="ca-ch ca-g"><img src="window.jpg" alt=""></div>
  <div class="ca-ch ca-b"><img src="window.jpg" alt=""></div>
</div>
```

The `.ca` box needs a size (for example `aspect-ratio: 3 / 2`). The copies fill it.

## Options

| Class or property | What it does |
|---|---|
| `.ca` | The look, at rest |
| `.ca-ch` with `.ca-r`, `.ca-g`, `.ca-b` | One copy per colour channel |
| `.ca.ca-in` | Starts clean and splits the channels when `play.js` adds `.go` to it or an ancestor |
| `--ca` | Strength: red grows by twice this, green by this. Default `.01`, a fringe of about 1% of the distance from the centre |
| `--ca-delay` | Wait before the split. Default `.2s` |

## Do

- Use it on pictures with hard dark-on-light edges near the frame: window frames, branches, lettering on a sign.
- Keep `--ca` between `.005` and `.02`. Past that it reads as a glitch effect, not a lens.

## Do not

- Use it on text the reader needs, or on a picture with a person's face in a corner.
- Expect it to work on a transparent picture: the copies add up against black, so give the picture its own background.

## Reduced motion

The fringes are there from the start; nothing moves.

## Without JavaScript

`.ca-in` shows the finished look when `play.js` is not loaded.
