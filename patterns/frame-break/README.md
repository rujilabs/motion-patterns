# Frame break

One panel lifts out of a flat app screen in 3D, leaving its place visibly empty, then drops back when asked.

[Live demo](https://motion.rujilabs.com/patterns/frame-break/) · [style.css](style.css) · [frame-break.js](frame-break.js)

## Use

```html
<div class="fb-scene"><div class="fb-screen">
  <div class="fb-slot"><article class="fb-card is-out">Next patient</article></div>
</div></div>
```

## Options

| Name | What it does |
|---|---|
| `.is-out` | Lifts the card out of the screen. Toggle it from your own control |
| `translateZ` | How far the card travels. Keep it under the perspective distance |

## Do

Lift the one thing the person should act on. Keep the empty slot so the eye reads where it came from.

## Do not

Do not lift more than one panel at a time, and do not lift text small enough to blur while moving.

## Reduced motion

The card stays lifted, and the button swaps it with no movement.
