# Card flip

A card turns over in 3D to show its back. Both faces share one grid cell, so the card is as tall as its taller face, and the turn lands with a slight overshoot.

[Live demo](https://motion.rujilabs.com/patterns/card-flip/) · [style.css](style.css) · [flip.js](flip.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="card-flip/style.css">
<script src="card-flip/flip.js"></script>

<div class="flip" id="card">
  <div class="flip-inner">
    <div class="flip-front">Front</div>
    <div class="flip-back">Back</div>
  </div>
</div>
<button type="button" data-flip aria-controls="card" aria-pressed="false">Turn over</button>
```

## Variants

| Class or attribute | What it does |
|---|---|
| `.flip-hover` on `.flip` | Turns on hover and while anything inside has focus. Give the card `tabindex="0"` if nothing inside can take focus |
| `.is-flipped` on `.flip` | Turned. `flip.js` toggles it from a `[data-flip]` button and makes the hidden face `inert` |
| `.flip-toggle` checkbox inside `.flip` | Turns it with no script |
| `.flip-x` on `.flip` | Turns over the top edge instead of the side |
| `data-label-off` / `data-label-on` on the button | Labels for each side; `flip.js` swaps them |
| `--flip-depth` | Perspective distance. Default `900px`; smaller is more dramatic |

## Do

- Put the action that turns the card next to it, and say what is on the back ("Show the meaning").
- Keep the same size and corner radius on both faces.

## Do not

- Hide something essential behind a hover-only card: touch screens have no hover. Use the button variant.
- Put links on the back of a hover card: the card turns back as the pointer moves to them from outside.

## Reduced motion

The transition is removed, so the faces swap in place with no turn.
