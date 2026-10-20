# Light sweep

A band of light passes across a button, card or logo, the way a lamp catches a sheet of glass. The band travels from fully off one side to fully off the other, so it never pops in or out.

[Live demo](https://motion.rujilabs.com/patterns/light-sweep/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="light-sweep/style.css">

<button class="sheen sheen-hover">Order now</button>
```

`.sheen` clips its content (`overflow: clip`) and draws the band in `::after`, so the host cannot use its own `::after`.

## Variants

| Class or property | What it does |
|---|---|
| `.sheen-hover` | One pass on hover or keyboard focus |
| `.sheen-in` | One pass when `play.js` adds `.go` to it or an ancestor with `data-play` |
| `.sheen-loop` | One pass every `--sheen-every` (default `5s`), the band resting off the edge in between |
| `.sheen-pause` inside a `.sheen-group` | A checkbox that stops every looping sweep in the group |
| `--sheen-color` | The light. Default white at 50%. Use less on dark surfaces, more on small marks |
| `--sheen-angle` | The slant of the band. Default `105deg` |
| `--sheen-width` | Half the band width, as a share of the element. Default `14%` |

## Do

- Use it on one thing per screen, the thing you want tapped or noticed.
- Keep the light faint on large surfaces. It should read as a surface catching light, not a white stripe.

## Do not

- Loop it on more than one element: several sweeps at once look like a loading state.
- Use it on body text. The band crosses the letters and makes them harder to read for a moment.

## Reduced motion

The band stays off the element and never moves, and the pause toggle hides.
