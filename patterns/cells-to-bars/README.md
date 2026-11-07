# Cells to bars

Numbers fill a row of table cells seen from above, then the camera tilts and each cell rises as a solid 3D bar as tall as its value.

[Live demo](https://motion.rujilabs.com/patterns/cells-to-bars/) · [style.css](style.css) · [cells-to-bars.js](cells-to-bars.js)

## Use

```html
<div class="cb-scene"><div class="cb-grid">
  <div class="cb-bar">
    <i class="cb-front"></i><i class="cb-side"></i><b class="cb-top">14</b>
  </div>
</div></div>
```

## Options

| Name | What it does |
|---|---|
| `--h` | Final bar height, in px |
| `--i` | Position in the row, sets the stagger |

## Do

Use it once, for the one comparison a page is about. Keep the value on the top face so the number stays readable after the tilt.

## Do not

Do not overshoot the height: a bar that passes its value for a moment shows a wrong number. Do not use it for more than about 12 values.

## Reduced motion

The bars show tilted at full height, with no animation.
