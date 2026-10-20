# Silhouette

The light behind is so much brighter than the subject that the subject drops to a flat dark shape and only its outline reads. In the demo the sky behind the bust brightens over about 3 seconds.

[Live demo](https://motion.rujilabs.com/patterns/silhouette/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="silhouette/style.css">
<script src="play.js"></script>

<figure class="look-silhouette" data-play>
  <img class="look-subject" src="climber.png" alt="A climber on a ridge">
</figure>
```

The subject must be a cut-out (an inline SVG or a transparent PNG). Leave out `data-play` for the finished look with no motion.

## Options

| Class or property | What it does |
|---|---|
| `data-play` on the frame or an ancestor | The light behind rises once the frame is in view |
| `--silhouette-sky` | The bright sky, any background image. Default a warm evening gradient |
| `--silhouette-dusk` | The dull sky before the light rises |
| `--silhouette-sun`, `--silhouette-x`, `--silhouette-y` | The brightest patch, low behind the subject |
| `--silhouette-depth` | How dark the subject gets, as a brightness. Default `.06` |
| `--silhouette-dur` | Time for the light to rise. Default `2.7s` |

## Do

- Pick a subject with a clear outline: a profile, a hand, a tree. The outline is all that is left.
- Put the brightest part of the sky right behind the subject.

## Do not

- Put text or a face that must be recognised in a silhouette.
- Use a pure black subject on a pure white sky; a slight lift (`.06`) keeps it from looking like a hole.

## Reduced motion

Nothing moves. The frame shows the bright sky and the dark shape.

## Without JavaScript

The start state only applies under `.js`, which `play.js` sets. Without it the finished look shows.
