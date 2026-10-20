# Blue hour

The short time after sunset when the sky is deep blue but still bright enough to see by, and warm lights come on against it. In the demo the same square as [golden hour](../golden-hour/) cools to blue, then the street lamp and the windows switch on one by one.

[Live demo](https://motion.rujilabs.com/patterns/blue-hour/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="blue-hour/style.css">
<script src="play.js"></script>

<figure class="look-blue" data-play>
  <img src="street.jpg" alt="A street">
  <svg class="look-blue-light" viewBox="0 0 320 240" aria-hidden="true">
    <rect class="look-blue-on first" x="124" y="146" width="12" height="16" fill="#ffd486"/>
    <rect class="look-blue-on later" x="216" y="120" width="14" height="14" fill="#ffd486"/>
  </svg>
</figure>
```

```css
.first { --blue-on-at: 1.3s; }
.later { --blue-on-at: 1.7s; }
```

The cool layer sits over everything inside the frame, so anything that must stay warm goes in the `.look-blue-light` layer above it, drawn over the windows of the picture underneath. Leave out `data-play` for the finished look with no motion.

## Options

| Class or property | What it does |
|---|---|
| `data-play` on the frame or an ancestor | Dusk falls once the frame is in view |
| `.look-blue-light` | The layer for lights, above the cool grade, with a soft warm glow |
| `.look-blue-on` | One light; it switches on at `--blue-on-at` (default `0s`) |
| `--blue-grade`, `--blue-strength` | The cool multiply layer and how strong it is. Default `.92` |
| `--blue-glow` | The glow around every light |
| `--blue-dur` | Time for dusk to fall. Default `1.8s` |

## Do

- Switch the lights on after the sky has mostly turned, and not all at once.
- Keep some sky in the frame: the blue of the sky is the point of the look.

## Do not

- Light every window. A few lit and most dark reads as evening; all lit reads as a poster.
- Use it with the golden hour classes on one frame; they are two ends of the same evening.

## Reduced motion

Nothing moves. The frame shows the blue scene with every light on.

## Without JavaScript

The start state only applies under `.js`, which `play.js` sets. Without it the finished look shows.
