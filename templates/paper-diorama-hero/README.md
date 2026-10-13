# Paper diorama hero

A tea estate at first light, cut from paper. The far ridge is already there; the nearer hills land back to front, the sun climbs from behind the ridge while the sky warms and the stars go out, clouds slide in from both sides, then the bungalow and its trees fold up on a hinge and the windows flicker on. After the build, every layer follows the pointer by its depth. The headline and button are readable from the first frame.

[Live demo](https://motion.rujilabs.com/templates/paper-diorama-hero/) · [index.html](index.html) · [style.css](style.css) · [scene.js](scene.js)

Built from the [paper](../../patterns/paper/) pattern (the hinge fold, the card fade and the grain) and [pop](../../patterns/pop/) (the sunrise tag). Copy CSS in the gallery gives one file with tokens, both patterns and this template.

## Use

```html
<link rel="stylesheet" href="bundle.css">
<script src="play.js"></script>
<script src="scene.js" defer></script>
```

Each layer is a `div.ply` holding one full-size SVG with the same view box (`0 0 1600 900`, `xMidYMax slice`), so layers line up at every size and each one can carry its own cast shadow and move on its own.

## What moves and when

| Time | What moves |
|---|---|
| 0 | Night sky, stars, the far ridge and all the copy |
| 0.16 to 1.6s | Four hill layers rise back to front, 160ms apart, each from a small tilt (`--tilt`) |
| 0.16 to 2.9s | The sun climbs from behind the far ridge; the dawn sky fades in over the night one; the stars dim |
| 0.8 to 2.7s | Clouds slide in from the left and right, then the mist band |
| 1.0s | Two leaf sprigs swing up into the front corners on a spring |
| 1.3 to 2.2s | The bungalow, three silver oaks and the lamp fold up from the hill |
| 2.0 to 2.9s | Windows flicker on one by one, the lamp glows, one curl of steam leaves the chimney |
| 2.7s | The sunrise tag pops on |
| After | Pointer depth: near layers travel further than far ones |

Nothing loops, so there is nothing to pause.

## Depth and shadows

- **Deckled edges:** the `#deckle` SVG filter wobbles every cut edge with turbulence and adds a 2px lighter rim on top, like the fibres of torn card.
- **Cast shadows:** each layer has two CSS `drop-shadow()`s, a tight contact shadow and a soft one, thrown down and left, away from the sun. They land on the layer behind.
- **Depth:** `--d` on each layer, from `.05` (sun) to `1.5` (front leaves).

## JS notes

`scene.js` (under 1 KB gzipped) listens for `pointermove` on the hero and writes `--mx` and `--my` (each -1 to 1) on `.scene` with `style.setProperty`. CSS turns them into a `translate` per layer: `calc(var(--mx) * var(--d) * -30px)`. The values ease towards the pointer on `requestAnimationFrame`, and the loop stops as soon as they arrive. On `pointerleave` the scene drifts back to centre. The entrance animates `transform` and the pointer moves `translate`, so the two never fight. While that loop runs, `.scene` carries `.is-moving` and the layers are promoted (`will-change: translate`), so moving them repaints nothing; at rest they are not, so their blurred shadows are painted once instead of being redrawn on every scrolled frame.

## Make it yours

- **Palette:** fills are in `index.html`; the two sky gradients are `.hero` (night) and `.sky::after` (dawn). Keep the far layers close to the sky colour and the near ones darkest.
- **Subject:** keep it in the right half of the view box (here x 790 to 1240), clear of the copy on wide screens.
- **Phones:** under 900px and portrait the copy sits on the night sky and the diorama is a band below it. The layers are taller than the band and wider to the left, which crops the empty sky and centres the subject.

## Reduced motion

The scene shows at sunrise with everything in place, the windows lit and the tag on. The pointer does not move the layers.

## Without JavaScript

The same finished scene. Every hidden start state is written under `.js`, which `play.js` sets.
