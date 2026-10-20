# Image zoom on hover

The picture grows slowly inside a frame that keeps its size, so the layout stays still and only the view moves closer. In takes 1.8s so the eye has time to explore; out takes 0.9s so the card settles as soon as the pointer moves on.

[Live demo](https://motion.rujilabs.com/patterns/image-zoom/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="image-zoom/style.css">

<a class="zoom-host" href="/notes/ridge">
  <span class="zoom frame">
    <img class="zoom-media" src="ridge.jpg" alt="">
  </span>
  The ridge before the fog lifts
</a>
```

Give the frame its own size (an `aspect-ratio`, or a width and height). The media fills it with `object-fit: cover`.

## Parts and options

| Class or property | What it does |
|---|---|
| `.zoom` | The frame: clips the picture and never changes size |
| `.zoom-media` | The `img`, `svg` or `video` that scales |
| `.zoom-host` | Optional. A card or link around the frame; hovering or focusing anywhere on it starts the zoom |
| `--zoom-scale` | How far in. Default `1.08` |
| `--zoom-origin` | Where it zooms toward. Default the centre; `50% 30%` keeps faces in view |

## Do

- Put the zoom on the whole card (`.zoom-host`), so the title and the picture answer together.
- Keep the scale under 1.12. Past that, edges of the subject start to fall out of the frame.

## Do not

- Zoom pictures that are not links. The motion says "you can open this".
- Zoom a low-resolution image: scaling shows the blur.

## Reduced motion

The picture stays at its normal size. The card's other hover cues (the underlined title in the demo) still show.
