# High-key

Bright, soft and low in contrast: nearly every tone sits between a light mid grey and white, colour is thin and nothing is truly dark. In the demo the window seat grades into high-key over about 3 seconds.

[Live demo](https://motion.rujilabs.com/patterns/high-key/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="high-key/style.css">
<script src="play.js"></script>

<figure class="look-high-key" data-play>
  <img src="kitchen.jpg" alt="A kitchen table by a window">
</figure>
```

Leave out `data-play` for the finished look with no motion.

## Options

| Class or property | What it does |
|---|---|
| `data-play` on the frame or an ancestor | The grade fades in once the frame is in view |
| `--hk-contrast` | How flat the tones get. Default `.55` (1 is unchanged) |
| `--hk-bright` | Brightness after flattening. Default `1.3` |
| `--hk-sat` | Colour left. Default `.6` |
| `--hk-wash`, `--hk-strength` | The white screen layer on top and how strong it is. Default white, `.4` |
| `--hk-dur` | Time to grade in. Default `2.7s` |

## Do

- Use it for calm, open, clean subjects: product shots on white, morning rooms, health and care.
- Keep text on a high-key section dark and heavy enough to read; the grade lifts everything under it.

## Do not

- Put it on a picture whose meaning lives in its shadows: they will be gone.
- Stack it with other grade classes on the same element; the filters multiply.

## Reduced motion

Nothing moves. The frame shows the finished high-key grade.

## Without JavaScript

The start state only applies under `.js`, which `play.js` sets. Without it the finished look shows.
