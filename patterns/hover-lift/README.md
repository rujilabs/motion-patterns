# Hover lift

A card rises a few pixels on hover while a long, soft shadow grows under it, as if it left the table. A press pushes it back down fast and it springs up again on release.

[Live demo](https://motion.rujilabs.com/patterns/hover-lift/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="hover-lift/style.css">

<a class="card lift" href="/rooms/quiet">Quiet room</a>
```

Put `.lift` on the clickable element itself (a link or a button), so hover, focus and press all belong to the same thing.

## Options

| Class or property | What it does |
|---|---|
| `.lift` | Rises on hover and keyboard focus (on devices that can hover), presses down on `:active` |
| `--lift-y` | How high it rises. Default `-4px`. Keep it between `-2px` and `-6px` |
| `--lift-shade` | The shadow colour as HSL channels, default `220 30% 12%`. On a dark page use a near-black, for example `220 40% 3%` |

The shadow has two layers: a tight contact shadow that is always there, and a long one with a negative spread that grows as the card rises. That pairing is what reads as height rather than blur.

## Do

- Use it on cards that are links or buttons, so the lift promises a click.
- Keep the press. Without it the card feels like a picture that floats, not a thing you can push.

## Do not

- Lift cards that do nothing when clicked.
- Lift big panels or whole sections: a large moving block looks like a layout bug.

## Reduced motion

The card does not move or scale. The shadow still changes on hover and press, at once, so the state is still visible.
