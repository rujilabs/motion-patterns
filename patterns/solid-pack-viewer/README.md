# Pack viewer

Use when: a product page sells something in a box, and buyers want to read the back before they buy.

A product box built from six real faces in CSS 3D. Drag it to turn it, the way you would turn a box in your hand: it follows your finger one to one, lifts a little off the floor while you hold it, and when you let go it keeps the speed of your flick, then a spring settles it square on the face it was heading for. Arrow keys turn it a quarter at a time. Every face is shaded from one fixed light above and to the left, recomputed every frame from the face's real normal, so a side goes dark as it turns away. The contact shadow is sized from the box's actual footprint and fades and blurs with the gap under its lowest corner.

[Live demo](https://motion.rujilabs.com/patterns/solid-pack-viewer/) · [style.css](style.css) · [pack-viewer.js](pack-viewer.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="solid-pack-viewer/style.css">
<script src="solid-pack-viewer/pack-viewer.js" defer></script>

<div class="pack" tabindex="0" role="slider" aria-roledescription="3D box"
  aria-label="Tea box, drag or use the arrow keys to turn it"
  aria-valuemin="0" aria-valuemax="359" aria-valuenow="32" aria-valuetext="Front"
  data-back="Back: ingredients and barcode" data-left="Left side: how to brew">
  <div class="pack-lift"><div class="pack-box">
    <div class="pack-face pack-front">Front artwork</div>
    <div class="pack-face pack-back">Ingredients, nutrition, barcode</div>
    <div class="pack-face pack-left">How to brew</div>
    <div class="pack-face pack-right">Best before</div>
    <div class="pack-face pack-top">Open here</div>
    <div class="pack-face pack-bottom">Recycling</div>
  </div></div>
  <div class="pack-shadow" aria-hidden="true"></div>
</div>
```

The printing on each face is plain HTML (text, tables, an SVG barcode), so it stays sharp at any angle and screen readers read it all.

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `--pack-w`, `--pack-h`, `--pack-d` (on `.pack`) | Width, height and depth of the box | `190px`, `270px`, `72px` |
| `--pack-floor` | How far below the box's centre the floor and shadow sit | `190px` |
| `--pack-shadow` | Shadow colour as `r g b` | `40 30 10` |
| `--pack-ring` | Focus ring colour | `#2563eb` |
| `data-front` ... `data-bottom` | What `aria-valuetext` says when that face is in front | The face name |
| `el.pack.show("back")` | Turns to a face by the shortest way | |
| `packface` event | Fires on `.pack` when a new face comes to the front, `detail.face` | |

Keys: Left and Right turn a quarter, Up shows the top, Down the bottom, Home the front, End the back.

## Do

- Print real packaging: ingredients, a nutrition table, a working barcode, the packer's address. That is what people turn a box over to read.
- Keep the face colours flat. The light does the shading; a gradient fights it.
- Offer buttons for the faces too (the demo has a row), for people who will not discover the drag.

## Do not

- Use it for something that is not a box. A bottle or a bag needs a different solid.
- Put text smaller than about 8px on a face: it gets smaller again as the face turns.

## Reduced motion

The box still turns while you drag it, since that is your own hand moving it, but there is no coasting or spring: it stops where you let go and snaps square, and keys and buttons jump straight to the face.

## See also

[`cube`](../cube/) turns between four views of a page; this is an object you inspect.
