# Dot field push

Use when: an event hall booking hero needs a quiet backdrop that makes way for the visitor, the way a crowd parts when someone walks through.

A grid of dots sits behind the hero. Each dot hangs on its own damped spring (damping ratio .6, so one small overshoot). The pointer pushes every dot within `--df-reach` straight away from it, hardest at the centre and fading to nothing at the edge, and the pushed dots turn the accent colour. When the pointer leaves, they spring home. A link or button that gets keyboard focus inside the field parts the dots around itself the same way. On first view a short walk crosses the field once (1.8 s, a Web Animation), so the effect shows before anyone moves.

[Live demo](https://motion.rujilabs.com/patterns/dot-field-push/) · [style.css](style.css) · [dot-field-push.js](dot-field-push.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="dot-field-push/style.css">
<script src="dot-field-push/dot-field-push.js" defer></script>

<section class="dot-field" data-df-rest="0.66 0.24">
  <canvas class="df-canvas" aria-hidden="true"></canvas>
  <h1>Room for 420 guests, and Saturday 12 December is still open.</h1>
  <a href="#hold">Hold 12 Dec</a>
</section>
```

The canvas fills the `.dot-field` behind its content. Give the text a paper panel if it sits over dense dots.

## Options

| Name | What it does | Default |
|---|---|---|
| `--df-gap` | Space between dots | `22px` |
| `--df-reach` | How far the push spreads from the pointer | `120px` |
| `--df-dot` | Dots at rest | Grey blue |
| `--df-near` | Dots that have been pushed more than 3 px | Gold |
| `data-df-rest` | Where the still frame is parted, as shares of the width and height | `0.75 0.35` |

On touch, a finger dragged across the field pushes the dots. The field keeps `touch-action: pan-y`, so the page still scrolls.

## Do

- Keep the dots faint. They are a backdrop; the hall, the date and the price are the content.
- Use it on one hero per page.

## Do not

- Do not put small text straight on top of the dots without a panel behind it.
- Do not set `--df-gap` below about 14px on a large hero: the dot count grows with the square and phones pay for it.

## Reduced motion

The dots are drawn once, already parted around the `data-df-rest` point, and never move. Without the script the canvas shows the same grid as a CSS dot pattern.
