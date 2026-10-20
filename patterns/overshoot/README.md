# Overshoot

The element runs a little past its target and settles back. It says "this landed here" for things that slide into place: a slider thumb, a selection ink, a tag, a panel.

[Live demo](https://motion.rujilabs.com/patterns/overshoot/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="overshoot/style.css">

<!-- a thumb that moves when its left changes -->
<span class="thumb overshoot"></span>

<!-- a panel that slides in from the right and settles -->
<aside class="panel overshoot-in os-from-right">...</aside>
```

## Variants

| Class or property | What it does |
|---|---|
| `.overshoot` | Transitions `left`, `right`, `top`, `bottom`, `width`, `height` and `translate` on `--ease-paper`: about 5% past, in proportion to the move |
| `.overshoot-spring` | The same on `--ease-spring`: about 20% past. Short moves of small things only |
| `.overshoot-in` | Entrance on load: from `--os-from`, a fixed `--os-past` beyond its place, then home |
| `.overshoot-in-go` | The same entrance, held until `play.js` adds `.go` |
| `.os-from-right`, `-left`, `-below`, `-above` | Sets the side it comes from and which way it overshoots |
| `--os-from` | Start offset as a `translate` value, default `0 100%` |
| `--os-past` | How far past it goes, default `0 -8px`. Keep it under about 12px |
| `--os-delay` | Wait before the entrance |

## Do

- Use the proportional `.overshoot` for things that travel different distances, like a thumb jumping between values: a short move barely overshoots, a long one clearly does.
- Use the fixed `.overshoot-in` for entrances, so a panel coming from far away does not swing wide.

## Do not

- Overshoot text a person is reading, or a whole page. It reads as a wobble.
- Combine it with a scale bounce on the same element. One kind of give is enough.

## Reduced motion

Everything moves to its place at once: no transition, no entrance.
