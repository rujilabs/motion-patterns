# Double exposure

Two frames on one piece of film. A dark subject on a light ground, with a second picture laid over it in screen blend mode: the light ground stays light, and the second picture shows only where the subject is dark, so it fills the silhouette. In the demo a landscape fades into a head and shoulders profile and settles from a slight drift.

[Live demo](https://motion.rujilabs.com/patterns/double-exposure/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="double-exposure/style.css">
<script src="play.js"></script>

<figure class="look-double" data-play role="img" aria-label="A forest inside the profile of a walker">
  <img src="profile.jpg" alt="">
  <img class="look-double-second" src="forest.jpg" alt="">
</figure>
```

The second picture must be the same size as the first. Leave out `data-play` for the finished look with no motion.

## Options

| Class or property | What it does |
|---|---|
| `data-play` on the frame or an ancestor | The second exposure fades in once the frame is in view |
| `.look-double-second` | The second picture, laid over the first in screen blend mode |
| `--double-strength` | How much of the second picture shows. Default `1` |
| `--double-from` | How far it drifts up from. Default `8%` |
| `--double-dur` | Time to fade in and settle. Default `2.7s` |

## Do

- Shoot or draw the subject very dark on a near-white ground: the cleaner the split, the cleaner the silhouette.
- Give the second picture a clear horizon or skyline that sits across the head.

## Do not

- Use a subject on a dark ground: screen blend then shows the second picture everywhere.
- Put a busy, high-contrast second picture inside a small silhouette; the shape gets lost.

## Reduced motion

Nothing moves. The frame shows both exposures, settled.

## Without JavaScript

The start state only applies under `.js`, which `play.js` sets. Without it the finished look shows.
