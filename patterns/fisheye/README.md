# Fisheye

A strong barrel distortion, the look of an ultra wide fisheye lens. The middle swells toward the viewer, straight lines bow outward and the picture falls off toward the corners. The drawing bends from flat to fisheye when it comes into view.

[Live demo](https://motion.rujilabs.com/patterns/fisheye/) · [style.css](style.css) · [fisheye.js](fisheye.js)

## Use

Draw the scene in SVG with plain shapes (`line`, `rect`, `polyline`, `polygon`, `circle`) and mark the svg with `data-fisheye`. The script turns every shape into a many-point path and moves each point.

```html
<link rel="stylesheet" href="fisheye/style.css">
<script src="fisheye/fisheye.js" defer></script>

<section class="fisheye-group">
  <label><input type="checkbox" data-fisheye-toggle checked> Fisheye</label>
  <div class="fisheye">
    <svg viewBox="0 0 320 200" data-fisheye="1" role="img" aria-label="A street front">
      <rect x="18" y="40" width="64" height="104" fill="#c5d0de"/>
      <line x1="0" y1="160" x2="320" y2="160" stroke="#6b7a90"/>
    </svg>
    <span class="fisheye-edge" aria-hidden="true"></span>
  </div>
</section>
```

## Options

| Attribute or class | What it does |
|---|---|
| `data-fisheye` on the svg | Strength. `1` doubles the middle; `.5` is a gentle wide angle; `2` is extreme |
| `.fisheye` | The frame. The script adds `.is-bent` while the distortion is on |
| `.fisheye-edge` | The corner falloff that fades in with the bend. Colour from `--fisheye-edge` (default black) |
| `data-fisheye-toggle` | A checkbox in the same `.fisheye-group` that flattens and bends again. Unchecked at load: the drawing starts flat and waits |

The corners stay where they are and the middle is magnified, so the frame stays full. Shapes that sat just inside the edge are pushed out of view; leave room around the subject.

## Do

- Draw on a grid or with long straight lines. The bend only reads where there is something straight to bend.
- Keep the subject in the middle: that is where a fisheye puts it, close and large.

## Do not

- Use it on paths drawn with curves (`path` with `C` or `A` commands). The script only reads plain shapes; draw curves as polylines.
- Bend text the reader needs. Put words outside the frame.

## Reduced motion

The drawing shows already bent, with the corner falloff, and the toggle switches at once with no tween.

## Without JavaScript

The drawing shows flat, with no falloff. Browsers without the CSS `d` property get the bent drawing at once, with no tween.
