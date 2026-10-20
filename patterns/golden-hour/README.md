# Golden hour

The last hour of sun: the light is low, warm and soft, and every shadow is long. In the demo the sun lowers to the horizon over about 3 seconds, the square grades into gold and the shadows of the lamp post, the person, the bench and the tree stretch across the ground.

[Live demo](https://motion.rujilabs.com/patterns/golden-hour/) · [style.css](style.css)

## Use

On any image or section, for the grade alone:

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="golden-hour/style.css">
<script src="play.js"></script>

<figure class="look-golden" data-play>
  <img src="street.jpg" alt="A street">
</figure>
```

In a scene you draw yourself, mark the sun and the shadows too:

```html
<figure class="look-golden" data-play>
  <svg viewBox="0 0 320 240">
    <circle class="look-golden-sun" cx="44" cy="148" r="11"/>
    <path class="look-golden-shadow" d="M69 212 L 71 211 L 250 219 L 247 222 Z"/>
  </svg>
</figure>
```

Draw each shadow at its long, final length, starting at the object's foot. Leave out `data-play` for the finished look with no motion.

## Options

| Class or property | What it does |
|---|---|
| `data-play` on the frame or an ancestor | The sun goes down once the frame is in view |
| `.look-golden-sun` | An element that lowers into place. Start height with `--golden-sun-from` (default `-320%` of its own size) |
| `.look-golden-shadow` | A shadow that stretches from its foot. Start length `--golden-short` (default `.3`), foot `--golden-foot` (default `0 50%`, the left end) |
| `--golden-grade`, `--golden-strength` | The warm multiply layer and how strong it is. Default `.72` |
| `--golden-sun-x`, `--golden-sun-y`, `--golden-glow`, `--golden-glow-size` | The glow around the sun |
| `--golden-dur` | Time for the sun to go down. Default `2.7s` |

## Do

- Put the glow where the sun is in the picture, low and to one side.
- Point every shadow away from the sun, all at the same angle.

## Do not

- Use it on a scene with short shadows under a high sun; the grade alone looks like a filter.
- Push `--golden-strength` near `1` on photos of people: skin goes orange.

## Reduced motion

Nothing moves. The frame shows the gold grade, the sun low and the shadows long.

## Without JavaScript

The start state only applies under `.js`, which `play.js` sets. Without it the finished look shows.
