# Split lighting

The key light sits at 90 degrees to one side, so half the face is lit and half is in shadow, split down the line of the nose. In the demo the light swings round from the front, and the shadow edge sweeps in from the far side, the way a real terminator does.

[Live demo](https://motion.rujilabs.com/patterns/split-lighting/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="split-lighting/style.css">
<script src="play.js"></script>

<figure class="look-split" data-play>
  <img src="portrait.jpg" alt="A portrait">
</figure>
```

The shadow is a multiply layer over the whole frame, so it works on any image or section. Set `--split-at` to the line down the subject's nose. Leave out `data-play` for the finished look with no motion.

## Options

| Class or property | What it does |
|---|---|
| `data-play` on the frame or an ancestor | The light swings round once the frame is in view |
| `--split-at` | Where the edge lands, across the frame. Default `50%` |
| `--split-side` | Direction of the light. `90deg` lights the left (default), `270deg` the right |
| `--split-soft` | Half the width of the soft edge. Default `2.5%` |
| `--split-shade` | The shadow colour and depth. Default near black at `.9` |
| `--split-dur` | Time for the swing. Default `2.7s` |

## Do

- Use a dark backdrop. The shadow covers the whole frame, and on a dark wall that reads as light falling off.
- Line the edge up with the nose, not the middle of the frame, when the subject is off centre.

## Do not

- Use it on a light, busy background: a straight dark half across the wall gives the trick away.
- Make the edge hard (`--split-soft: 0`). Even a hard light rolls off over a round face.

## Reduced motion

Nothing moves. The frame shows the half-lit look. Browsers without `@property` also jump straight to it.

## Without JavaScript

The start state only applies under `.js`, which `play.js` sets. Without it the finished look shows.
