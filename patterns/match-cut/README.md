# Match cut

A shape in one scene cuts to a matching shape in the next. Both scenes zoom on the same point, so at the cut the two shapes sit in the same place at the same size: a cup of tea seen from above becomes the evening sun.

[Live demo](https://motion.rujilabs.com/patterns/match-cut/) · [style.css](style.css)

## Use

Draw both images so the matching shape has the same centre and size, then point `--mc-x` and `--mc-y` at it.

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="match-cut/style.css">

<section class="match-cut-group">
  <label class="match-cut-pause"><input type="checkbox"> Pause</label>
  <div class="match-cut" tabindex="0" role="group" aria-label="A cup of tea cuts to the sun">
    <figure><img src="cup.jpg" alt="..."><figcaption>08:10</figcaption></figure>
    <figure><img src="sun.jpg" alt="..."><figcaption>19:02</figcaption></figure>
  </div>
</section>
```

```css
.match-cut { --mc-x: 50%; --mc-y: 46.67%; }
```

## Timing

Each scene owns half of `--mc-dur` (8s). It opens held close on the shape, pulls back to the full view, rests, pushes back in and holds, then the other scene replaces it on the same frame of time. The holds either side of the cut let the eye find the match. The frame does the cut (visibility steps, so there is no fade); only the frame's first child zooms, so captions stay still.

## Options

| Class or property | What it does |
|---|---|
| `--mc-x`, `--mc-y` | The centre of the matching shape, as a share of the frame. Default `50% 50%` |
| `--mc-zoom` | How close each scene is at the cut. Default `2.4` |
| `--mc-dur` | One full loop, both cuts. Default `8s` |
| `.match-cut-pause` inside `.match-cut-group` | A checkbox that stops the loop |

Hover and keyboard focus on the scenes stop it too.

## Do

- Match more than the outline when you can: size, position and a similar light or colour make the cut feel inevitable.
- Use it to join two moments that mean something together, such as morning and evening, plan and result.

## Do not

- Fade between the scenes. The match only works as a hard cut.
- Zoom so far that the matching shape fills the frame edge to edge; then there is nothing left to match.

## Reduced motion

Only the first scene shows at its full view, with no zoom and no cut, and the toggle hides.
