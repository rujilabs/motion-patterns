# Low-key

Mostly dark and high in contrast, with one pool of light. Everything outside the pool falls toward black; the lit part keeps its colour and gets a little warmth. In the demo the darkness closes in on the lamp, the face and the cup over about 3 seconds.

[Live demo](https://motion.rujilabs.com/patterns/low-key/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="low-key/style.css">
<script src="play.js"></script>

<figure class="look-low-key pool" data-play>
  <img src="desk.jpg" alt="A desk lamp over an open notebook">
</figure>
```

```css
.pool { --lk-x: 64%; --lk-y: 58%; --lk-w: 34%; --lk-h: 58%; }
```

Leave out `data-play` for the finished look with no motion.

## Options

| Class or property | What it does |
|---|---|
| `data-play` on the frame or an ancestor | The darkness closes in once the frame is in view |
| `--lk-x`, `--lk-y` | Centre of the pool of light. Default `50% 50%` |
| `--lk-w`, `--lk-h` | Size of the pool. Default `28%` by `44%` |
| `--lk-dark`, `--lk-strength` | The dark colour and how far it goes. Default `#06080b`, `.96` |
| `--lk-glow` | The warm glow inside the pool. Default a soft amber |
| `--lk-contrast` | Extra contrast on the picture. Default `1.25` |
| `--lk-dur` | Time for the dark to fall. Default `2.7s` |

## Do

- Put the pool where a light in the picture would really fall: under a lamp, through a window.
- Use one pool. Two pools split the eye and the look falls apart.

## Do not

- Put the pool on text you need read in full; the edges go dark.
- Use it on a bright scene with no light source in it; the darkness then reads as a vignette, not a lit room.

## Reduced motion

Nothing moves. The frame shows the dark room and the pool of light.

## Without JavaScript

The start state only applies under `.js`, which `play.js` sets. Without it the finished look shows.
