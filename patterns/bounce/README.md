# Bounce

Dropped from above, it hits the floor and bounces lower each time until it rests. Only the height changes: each bounce keeps half the speed of the last, so it rises a quarter as high and lasts half as long.

[Live demo](https://motion.rujilabs.com/patterns/bounce/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="bounce/style.css">

<div class="slot">
  <p class="card bounce">Design review, 14:00</p>
</div>
<span class="badge bounce-soft">1 new</span>
```

The element ends where the layout puts it and starts `--bounce-h` above. Give the space above it room, or let it pass over the header like the demo does.

## Variants

| Class or property | What it does |
|---|---|
| `.bounce` | Falls `--bounce-h`, then three bounces at 25%, 6% and 2% of that height |
| `.bounce-soft` | Falls, then one small bounce. For a badge or a count |
| `.bounce-in` | Add next to either: held until `play.js` adds `.go` |
| `--bounce-h` | Drop height, default `96px`. Scale it with the element: a 16px badge wants about 14px |
| `--bounce-dur` | The whole run, default `1.3s` (soft: `.8s`). Change it with the height so the fall still looks like gravity |

## Do

- Use it for a thing that lands somewhere real: a booking in a day, a file in a folder, a token on a board.
- Delay a second element until the first has settled (the demo's badge waits 1.15s).

## Do not

- Bounce text people need to read at once, or more than one or two things on a screen.
- Make it squash. If the body should change shape on the floor, use [squash and stretch](../squash-stretch/).
- Loop it. A bounce that never ends reads as a loading spinner.

## Reduced motion

The element shows in its place with no fall and no fade; the replay button does nothing.
