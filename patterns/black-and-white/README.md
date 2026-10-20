# Black and white

The colour drains out and leaves the picture in greys. The held colour accent variant keeps one object in colour, here the red cup. In the demo the colour drains over about 3 seconds; the switch shows and hides the held accent.

[Live demo](https://motion.rujilabs.com/patterns/black-and-white/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="black-and-white/style.css">
<script src="play.js"></script>

<figure class="look-bw" data-play>
  <img src="market.jpg" alt="A market stall">
</figure>
```

With a held colour accent, add a layer the same size as the frame that holds only the object, as a cut-out image or an SVG:

```html
<figure class="look-bw" data-play>
  <img src="market.jpg" alt="A market stall with a red umbrella">
  <img class="look-bw-keep" src="market-umbrella.png" alt="">
</figure>
```

Leave out `data-play` for the finished look with no motion.

## Options

| Class or property | What it does |
|---|---|
| `data-play` on the frame or an ancestor | The colour drains once the frame is in view |
| `.look-bw-keep` | A layer above the grade that keeps its colour |
| `--bw-strength` | How much colour goes. Default `1`; `.85` leaves a faint trace |
| `--bw-dur` | Time for the colour to drain. Default `2.7s` |

## Do

- Keep one accent, and make it the thing the page is about.
- Line the accent layer up with the picture exactly: same size, same crop.

## Do not

- Hold more than one colour; the accent stops being an accent.
- Use it for product colour choices or charts, where colour is the information.

## Reduced motion

Nothing moves. The frame shows in black and white, with the accent in colour if there is one.

## Without JavaScript

The start state only applies under `.js`, which `play.js` sets. Without it the finished look shows.
