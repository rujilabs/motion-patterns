# Zoom through

The camera pushes through an opening in one view into the next. The front view has a real hole in it, and the next view sits behind, already seen through the hole. Going in, the front grows around the hole until the hole is bigger than the frame, while the view behind grows to full size.

[Live demo](https://motion.rujilabs.com/patterns/zoom-through/) · [style.css](style.css) · [zoom.js](zoom.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="zoom-through/style.css">
<script src="zoom-through/zoom.js"></script>

<div class="zoom-through" id="scene">
  <div class="zoom-back">The room</div>
  <div class="zoom-front">
    <!-- an SVG with a hole: fill-rule="evenodd" and a second shape inside the first -->
  </div>
</div>
<button type="button" data-zoom-toggle aria-controls="scene" aria-pressed="false">Look inside</button>
```

Set `--zoom-x` and `--zoom-y` on `.zoom-through` to the centre of the hole, as a share of the frame.

## Options

| Class, attribute or property | What it does |
|---|---|
| `.is-inside` on `.zoom-through` | In. `zoom.js` toggles it and makes the hidden view `inert` |
| `--zoom-x`, `--zoom-y` | The point the camera pushes through. Default the centre |
| `--zoom-scale` | How far the front grows. Default `10`; raise it for a small hole |
| `--zoom-from` | The size the back view starts at. Default `.4` |
| `data-label-in`, `data-label-out` | Button labels for each state |

Going in accelerates and the front fades only in its last 200ms, so you see the push, not a fade. Going back decelerates, like a step back.

## Do

- Cut the hole for real. A painted window on top of the next view will not line up as it grows.
- Use it to go one level deeper, from outside to inside, from a list to one item.

## Do not

- Chain several in a row: one push is a moment, three are a ride.
- Put a lot of text on the front view. It grows ten times over and smears past the reader.

## Reduced motion

The transitions are removed, so the front view disappears and the back view shows at full size at once.
