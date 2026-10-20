# Butterfly lighting

The key light sits high and straight in front of the face. The forehead and cheekbones catch the light, a small butterfly shaped shadow falls under the nose and a soft shadow falls under the chin. In the demo the light rises from camera height, and the shadows drop out from under the nose and chin as it goes.

[Live demo](https://motion.rujilabs.com/patterns/butterfly-lighting/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="butterfly-lighting/style.css">
<script src="play.js"></script>

<figure class="look-butterfly sitter" data-play>
  <img src="portrait.jpg" alt="A portrait">
</figure>
```

```css
/* where the nose tip and the chin are, down the frame */
.sitter { --bf-x: 52%; --bf-nose: 44%; --bf-chin: 56%; }
```

Leave out `data-play` for the finished look with no motion.

## Options

| Class or property | What it does |
|---|---|
| `data-play` on the frame or an ancestor | The light rises once the frame is in view |
| `--bf-x` | The line of the nose, across the frame. Default `50%` |
| `--bf-nose`, `--bf-chin` | Height of the nose tip and the chin. Default `47.5%` `58.5%` |
| `--bf-fall` | How far below them the shadows land: higher light, longer drop. Default `2.5%` |
| `--bf-nose-w`, `--bf-nose-h`, `--bf-chin-w`, `--bf-chin-h` | Size of the two shadows |
| `--bf-top`, `--bf-light` | Height and colour of the highlight on the forehead |
| `--bf-shade`, `--bf-chin-shade` | The shadow colours under the nose and under the chin |
| `--bf-dur` | Time for the light to rise. Default `2.7s` |

## Do

- Keep the nose shadow small and short; it should stop well above the lip.
- Use a mid-tone backdrop. Butterfly is a bright, even look, not a dramatic one.

## Do not

- Raise `--bf-fall` far: a long nose shadow reads as harsh light from overhead, the look most people avoid.
- Use it on a face in profile; the nose shadow needs a face looking at the light.

## Reduced motion

Nothing moves. The frame shows the highlight and the two shadows in place. Browsers without `@property` jump straight to it.

## Without JavaScript

The start state only applies under `.js`, which `play.js` sets. Without it the finished look shows.
