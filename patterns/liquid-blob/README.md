# Liquid blob

Round shapes that pull out of each other, travel and melt into the next one, like drops of ink. Two circles that come close grow a bridge instead of overlapping.

[Live demo](https://motion.rujilabs.com/patterns/liquid-blob/) · [style.css](style.css)

## Use

Put the goo filter in the page once, then `.goo` on the layer that holds the blobs:

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="liquid-blob/style.css">

<svg width="0" height="0" aria-hidden="true" focusable="false">
  <filter id="goo" x="-20%" y="-50%" width="140%" height="200%" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceGraphic" stdDeviation="8"/>
    <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -11"/>
  </filter>
</svg>

<div class="blob-group">
  <label class="blob-pause"><input type="checkbox"> Pause</label>
  <div class="goo" aria-hidden="true">
    <span class="blob blob-breathe"></span>
    <span class="blob blob-travel"></span>
  </div>
</div>
```

Size and place every blob yourself (`.blob` is `position: absolute`). The travelling drops start centred on the first anchor.

## Parts

| Class or property | What it does |
|---|---|
| `.goo` | Applies the filter: blur the shapes together, then cut the blur back to a hard edge |
| `.blob` | A circle in `currentColor` |
| `.blob-travel` | Moves `--blob-dx` across, bulging `--blob-dy` at the middle, and starts again |
| `.blob-breathe` | An anchor that swells to 108% and back |
| `--blob-dur` | One trip, default 2.4s |
| `--blob-delay` | Offsets one drop from the others. Spread them evenly across `--blob-dur` |
| `.blob-pause` in `.blob-group` | A checkbox that pauses every blob in the group |

The filter's `stdDeviation` sets how far the bridge reaches; the last two numbers of the matrix (`24 -11`) set how hard the edge is cut. Raise the first for a crisper edge.

## Do

- Use one colour per goo layer. The filter works on the shape's edge, and two colours meeting turn into a muddy band.
- Keep text and icons outside the filtered layer, on top of it, as the demo does with the two devices. Inside, they would melt too.

## Do not

- Filter a large area. The blur runs on every frame, over the whole layer.
- Use it for progress that has a real number. Show the number; the blobs are only the feeling of movement.

## Reduced motion

A still picture: the anchors stay, the travelling drops are hidden, and the pause toggle hides.
