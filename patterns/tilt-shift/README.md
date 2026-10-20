# Tilt-shift

Blur bands at the top and bottom of a picture, with a small lift in colour, make a real scene look like a model. On load the blur fades in, then the band of focus drifts slowly up and down.

[Live demo](https://motion.rujilabs.com/patterns/tilt-shift/) · [style.css](style.css)

## Use

Wrap your image (or an SVG scene) in `.tilt-shift`. The wrapper needs a size; the image fills it.

```html
<section class="tilt-group">
  <label class="tilt-pause"><input type="checkbox"> Pause</label>
  <div class="tilt-shift">
    <img src="harbour-from-above.jpg" alt="The harbour seen from the hill">
  </div>
</section>
```

## Options

| Class or property | What it does |
|---|---|
| `.tilt-shift` | The look: blur bands, colour lift, and a band of focus that drifts. 14s a round |
| `.tilt-shift.tilt-still` | The look with the band held on the middle |
| `--tilt-blur` | Blur at the top and bottom. Default `4px` |
| `--tilt-travel` | How far the band drifts, as a share of the overlay (twice the frame). Default `8%` |
| `--tilt-dur` | One round of the drift. Default `14s` |
| `.tilt-pause` inside `.tilt-group` | A checkbox that pauses everything in the group |

## Do

- Use pictures taken from above: a street from a rooftop, a harbour from a hill. The trick needs a view a person could never have of a real model's scale.
- Give the scene small moving things in the band of focus, like cars or people. Movement in the sharp strip sells the toy.

## Do not

- Use it on close-ups or portraits. Without a high view it only looks like a smeared picture.
- Put text in the frame: half of it will be blurred.

## Reduced motion

The look is on from the start with the band of focus across the middle, and nothing drifts. The pause toggle hides.

## Browser support

The blur uses `backdrop-filter`. Where it is missing the picture keeps its colour lift and stays sharp.
