# Kaleidoscope

One thin slice of a picture, drawn and animated once, then mirrored and turned around a centre into a full circle. The shapes in the slice drift, so the whole pattern slowly changes shape, and the circle turns.

[Live demo](https://motion.rujilabs.com/patterns/kaleidoscope/) · [style.css](style.css) · [kaleido.js](kaleido.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="kaleidoscope/style.css">
<script src="kaleidoscope/kaleido.js"></script>

<section class="kaleido-group">
  <svg class="kaleidoscope" data-slices="12" viewBox="-100 -100 200 200" role="img" aria-label="A mirrored pattern">
    <g class="k-turn">
      <g class="k-slice">
        <g class="k-drift">
          <circle cx="46" cy="14" r="14" />
          ...
        </g>
      </g>
    </g>
  </svg>
  <label class="kaleido-pause"><input type="checkbox"> Pause</label>
</section>
```

Centre the `viewBox` on `0 0`. Draw the slice pointing right along the x axis and opening downward (positive y, which SVG turns counter-clockwise): with 12 slices it is the wedge between 0 and 30 degrees. Shapes may cross its edges; the script clips them.

## Parts

| Class or attribute | What it does |
|---|---|
| `.k-slice` | The one slice you draw. The script clips it to a wedge and adds the copies |
| `data-slices` | Number of slices, an even number, default 12 |
| `.k-drift` | Shapes inside the slice drift 12px and turn 10 degrees, back and forth over `--k-drift-dur` (7s) |
| `.k-turn` | The whole circle turns once in `--k-turn-dur` (90s) |
| `.kaleido-pause` inside `.kaleido-group` | A checkbox that pauses both |

Every second copy is mirrored before it is turned, so each edge meets its own mirror image and the seams disappear. Without the script only the first slice shows. The copies are real elements, not `<use>` references: browsers do not reliably share an animation with a `<use>` copy, and pausing or scrubbing would only reach the original.

## Do

- Let shapes cross the slice edges. A shape cut by the mirror becomes a whole, symmetric shape; that is where the pattern comes from.
- Keep the drift small. A few pixels in the slice is a big change in the circle.
- Use few colours and one key mark, like the red dots in the demo.

## Do not

- Use an odd number of slices: the last mirror has no partner and the seam shows.
- Put text in the slice. It comes back mirrored.

## Reduced motion

The pattern stays, still and whole: nothing drifts or turns. The pause toggle hides.
