# Backlighting

The light sits behind the subject. A glow spreads on the wall behind it, a halo wraps its outline and the side facing the camera falls into soft shade. In the demo the light rises over about 3 seconds.

[Live demo](https://motion.rujilabs.com/patterns/backlight/) · [style.css](style.css)

## Use

The subject must be a cut-out (an inline SVG or a transparent PNG) so the halo can follow its real outline.

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="backlight/style.css">
<script src="play.js"></script>

<figure class="look-backlight" data-play>
  <img class="look-subject" src="bust.png" alt="A plaster bust">
</figure>
```

Leave out `data-play` for the finished look with no motion.

## Options

| Class or property | What it does |
|---|---|
| `data-play` on the frame or an ancestor | The light rises once the frame is in view |
| `--backlight-ground` | The wall colour before the glow. Default a dark grey |
| `--backlight-color`, `--backlight-warm` | The core of the glow and its warm falloff |
| `--backlight-x`, `--backlight-y` | Where the light sits behind the subject. Default `50%` `42%` |
| `--backlight-front` | How dark the front gets, as a brightness. Default `.5` |
| `--backlight-dur` | Time for the light to rise. Default `2.7s` |

## Do

- Place the glow just behind the head or the top of the object, where a real lamp or low sun would be.
- Keep the subject's own colours mid-toned; the look darkens them by half.

## Do not

- Use it on a full photo with its own background: the halo needs an outline to follow.
- Drop `--backlight-front` below about `.3`. That is a silhouette, which has its own entry.

## Reduced motion

Nothing moves. The frame shows the finished look: glow behind, halo on, front in shade.

## Without JavaScript

The start state only applies under `.js`, which `play.js` sets. Without it the finished look shows.
