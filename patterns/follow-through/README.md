# Follow-through

The body stops, its loose parts do not. While the van drives, its aerial leans back; when it brakes, the aerial whips past upright, swings back, and settles in shrinking swings while the van rocks once on its wheels.

[Live demo](https://motion.rujilabs.com/patterns/follow-through/) · [style.css](style.css)

## Use

Body and parts share one clock, `--follow-dur`. The body travels in the first 45% of it, the parts settle in the rest.

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="follow-through/style.css">

<div class="van follow">
  <svg viewBox="0 -24 124 92">
    <g class="follow-rock">
      <g class="aerial follow-part">…</g>
      …body…
    </g>
    <g class="follow-spin">…wheel…</g>
  </svg>
</div>
```

```css
.van { --follow-x: -100cqi; }  /* arrives from one container width to the left */
.aerial { --follow-a: 22deg; }  /* stands up on a body moving right: positive */
.tag { --follow-a: -18deg; --follow-origin: 50% 0; } /* hangs down: negative, pivot at the top */
```

## Options

| Class or property | What it does |
|---|---|
| `.follow` | The body: arrives from `--follow-x`, `--follow-y` and stops |
| `.follow-part` | A loose part: lags, swings past, settles (1, -.6, .35, -.18, .07 of `--follow-a`) |
| `.follow-rock` | The body's top tips forward over its front wheel and back, by `--follow-rock` (default `2deg`) |
| `.follow-spin` | A wheel that turns two full turns while the body travels |
| `.follow-in` | Add next to each class to wait for `play.js` to add `.go` to an ancestor |
| `--follow-dur` | The shared clock, default `2s` |
| `--follow-origin` | The pivot of a part or the rock. Defaults: part `50% 100%`, rock `100% 100%` |

## Do

- Give different parts different amplitudes: a stiff part swings less than a whip.
- Let the body stop clean. The contrast between the still body and the moving part is the whole effect.

## Do not

- Swing a part that is fixed in real life, such as a door or a wheel arch. It reads as broken.
- Keep the swings going for long. Five swings that shrink fast are enough.

## Reduced motion

The van is parked, the aerial is upright, nothing moves; the replay button does nothing.
