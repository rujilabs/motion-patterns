# Camera zoom

The lens changes focal length while the camera stays where it is. The picture scales as one flat sheet toward a point: the background and the foreground grow by the same amount and nothing slides past anything else. If you want the world to open up around the subject, use [dolly in](../dolly-in/) instead.

[Live demo](https://motion.rujilabs.com/patterns/camera-zoom/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="camera-zoom/style.css">

<div class="camera-zoom-group">
  <div class="camera-zoom">
    <div class="camera-zoom-shot"><!-- one drawing or image --></div>
  </div>
  <label class="camera-zoom-pause"><input type="checkbox"> Pause</label>
</div>
```

Set the target on the frame: `.camera-zoom { --zoom-origin: 47% 62%; --zoom-to: 2.6; }`.

## Options

| Class or property | What it does |
|---|---|
| `--zoom-origin` | The point the lens closes in on, as a `transform-origin`. Default `50% 50%` |
| `--zoom-to` | The scale at the end of the zoom. Default `2.5` |
| `--zoom-dur` | Time for one zoom, holds included. Default `8s` |
| `.camera-zoom-out` | Starts close and zooms out to the whole picture |
| `.camera-zoom-pause` inside `.camera-zoom-group` | A checkbox that pauses the move |

The move runs for more than 5 seconds, so keep the pause toggle ([WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)).

## Do

- Use vector art or an image at least `--zoom-to` times the frame size, so the close frame stays sharp.
- Point `--zoom-origin` at one small thing the viewer should find: a lamp, a face, a price.

## Do not

- Zoom past about 3x on a photo: the pixels show.
- Zoom in and out in quick repeats. One slow push says more.

## Reduced motion

Nothing moves. The frame rests on the close view (on the whole picture with `.camera-zoom-out`) and the pause toggle hides.
