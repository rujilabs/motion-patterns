# Bounce cards

A fan of photo prints bounces up into place, one after another, when it comes into view. Hover, tap or Tab onto it and the fan spreads apart, and the print you are on lifts out of the row.

[Live demo](https://motion.rujilabs.com/patterns/bounce-cards/) · [style.css](style.css) · [bounce-cards.js](bounce-cards.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="bounce-cards/style.css">
<script src="play.js"></script>
<script src="bounce-cards/bounce-cards.js" defer></script>

<ul class="bc" data-play aria-label="Cover picks">
  <li><button type="button"><img src="akad.jpg" alt="The couple at the akad nikah"></button></li>
  <li><button type="button"><img src="merenjis.jpg" alt="Hennaed hands at the merenjis"></button></li>
  <li><button type="button"><img src="kompang.jpg" alt="The kompang group"></button></li>
  <!-- 3 to 7 prints -->
</ul>
```

`play.js` (in `<head>`, not deferred) adds `.go` when the fan is in view, which starts the entrance. `bounce-cards.js` places each print from the middle of the fan and adds `.bc-fan`. Put something focusable in each print (a button or link) so the keyboard can spread it.

## Options

| Property on `.bc` | What it does | Default |
|---|---|---|
| `--bc-gap` | Sideways step between prints at rest | `30px` |
| `--bc-tilt` | Turn per print at rest | `9deg` |
| `--bc-spread` | Sideways step when spread | `104px` |
| `--stagger` | Delay between prints on the way in | `80ms` |

The prints turn about a point under the fan (`transform-origin: 50% 130%`), so the fan opens like cards in a hand. A tap on a print adds `.is-open`, which spreads it on touch screens too; a tap outside closes it.

## Do

- Use 3 to 7 prints of the same size and shape.
- Leave room on both sides for the spread: about `--bc-spread` times the number of prints, plus one print.

## Do not

- Do not hide what the prints are behind the fan alone: name the picked one in text, as the demo's caption line does.
- Do not use it for a long gallery. Past seven prints the spread runs out of room and the stack hides too much.

## Reduced motion

The prints are in their fan from the start, with no bounce, and spread and lift without a transition.
