# Rembrandt lighting

The key light sits about 45 degrees to the side and a little above. The far side of the face falls into shadow, except a small triangle of light on that cheek, between the shadow of the nose and the shadow of the cheekbone. In the demo the light moves from the front to 45 degrees and the triangle is what stays lit.

[Live demo](https://motion.rujilabs.com/patterns/rembrandt-lighting/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="rembrandt-lighting/style.css">
<script src="play.js"></script>

<figure class="look-rembrandt sitter" data-play>
  <img src="portrait.jpg" alt="A portrait">
</figure>
```

```css
/* place the triangle under the far eye, as fractions of the frame */
.sitter { --rem-at: 48%; --rem-x: .52; --rem-y: .38; --rem-w: .1; --rem-h: .15; }
```

The shadow is a multiply layer; the triangle is a soft hole cut out of it with a mask, so whatever is under it stays as lit as the near side. Leave out `data-play` for the finished look with no motion.

## Options

| Class or property | What it does |
|---|---|
| `data-play` on the frame or an ancestor | The light moves to 45 degrees once the frame is in view |
| `--rem-at` | Where the shadow edge lands, just past the nose. Default `49.5%` |
| `--rem-x`, `--rem-y` | Top left of the triangle's box, as unitless fractions of the frame. Default `.505` `.395` |
| `--rem-w`, `--rem-h` | Size of the triangle's box, as fractions. Default `.09` `.14` |
| `--rem-side` | `90deg` lights the left (default), `270deg` the right; mirror the triangle with it |
| `--rem-soft`, `--rem-shade` | The edge softness and the shadow colour |
| `--rem-dur` | Time for the move. Default `2.7s` |

## Do

- Keep the triangle small: no wider than the eye and no longer than the nose. That is what makes it Rembrandt and not split or loop lighting.
- Leave a thin dark gap between the lit side and the triangle; it is the shadow of the nose.

## Do not

- Use it on a subject that is not facing the camera without moving the triangle: a box at the wrong place lights the wall.
- Stack it with another overlay look on the same frame; both use `::after`.

## Reduced motion

Nothing moves. The frame shows the shadow side with its triangle. Browsers without `@property` jump straight to it.

## Without JavaScript

The start state only applies under `.js`, which `play.js` sets. Without it the finished look shows.
