# Teal and orange

The film grade that pushes warm tones (skin, wood, lamplight) toward orange and the rest (walls, sky, clothes, shadows) toward teal, so people stand out warm against a cool frame. In the demo a divider wipes in from the right and stops halfway: the original on the left, the grade on the right.

[Live demo](https://motion.rujilabs.com/patterns/teal-and-orange/) · [style.css](style.css)

## Use

Blend layers cannot tell skin from a light wall, so the grade is an SVG colour matrix. Paste the filter once per page:

```html
<svg class="look-defs" aria-hidden="true" focusable="false">
  <filter id="look-teal-orange" color-interpolation-filters="sRGB">
    <feColorMatrix type="matrix" values="1.344 0.047 -0.311 0 -0.09  -0.28 1 0.28 0 0.025  -0.344 -0.047 1.311 0 0.09  0 0 0 1 0"/>
  </filter>
</svg>

<figure class="look-teal-orange">
  <img src="street.jpg" alt="A cyclist on a city street">
</figure>
```

A before and after that wipes in:

```html
<figure data-play>
  <div class="look-to-pair">
    <img src="street.jpg" alt="A cyclist on a city street, before and after the grade">
    <div class="look-teal-orange look-to-split"><img src="street.jpg" alt=""></div>
    <span class="look-to-line"></span>
  </div>
</figure>
```

## Options

| Class or property | What it does |
|---|---|
| `.look-teal-orange` | Applies the filter to every child of the element |
| `--to-contrast` | Extra contrast with the grade. Default `1.08` |
| `.look-to-pair`, `.look-to-split`, `.look-to-line` | The before and after frame, the graded copy and the divider |
| `--to-split` | Where the divider stops. Default `50%` |
| `--to-line`, `--to-dur` | Divider colour and wipe time. Default white, `2.7s` |

How it works: each row of the matrix reads how much warmer than blue a pixel is (red minus blue) and pushes it further that way, adds a small teal shift to neutral greys and a little more teal as tones get darker. For a gentler grade, move the numbers toward the identity matrix (`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0`).

## Do

- Use it on pictures with people or warm objects in them; the warm against cool is the whole point.
- Show the before and after once, to make the case for a grade, not on every picture.

## Do not

- Grade logos, products or brand colours: they shift hue.
- Expect the grade alone to fade in: an SVG filter cannot be tweened, so the motion is the divider.

## Reduced motion

Nothing moves. The divider sits at `--to-split` with the grade on its right.

## Without JavaScript

The start state only applies under `.js`, which `play.js` sets. Without it the divider is already in place.
