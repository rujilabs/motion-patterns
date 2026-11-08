# Electric border

Use when: one limited-drop or launch card must look charged and ready, set apart from the rest of the page until the drop opens.

A line of current runs round the card's rounded edge, pushed in and out by noise that drifts over time: two strands, each with a wide faint glow, a narrower glow and a bright core. The noise is made of whole waves round the loop, so it has no seam at any corner. Only the shape of the line moves; its brightness stays the same, so it crackles without ever flashing. Point at the card or tab into it and the current runs a little stronger.

[Live demo](https://motion.rujilabs.com/patterns/electric-border/) · [style.css](style.css) · [electric-border.js](electric-border.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="electric-border/style.css">
<script src="electric-border/electric-border.js" defer></script>

<article class="eb" id="drop">
  <canvas class="eb-canvas" aria-hidden="true"></canvas>
  <h2>Kilat shirt</h2>
  <p>Opens Fri 20 Nov, 9:00 pm. RM 189, 88 pieces.</p>
</article>
<button type="button" data-pause-for="drop" aria-pressed="false">Pause</button>
```

The canvas reaches past the card on every side, so leave about 20 px of room round it. The card's `border-radius` sets the shape the line follows.

## Options

| Name | What it does | Default |
|---|---|---|
| `--eb-color` | Colour of the glow | `#7cf3ff` |
| `--eb-core` | Colour of the bright middle line | `#f2feff` |
| `--eb-pad` | How far the canvas reaches past the card | `18px` |
| `--eb-line` | Width of the plain border shown without the script | `1.5px` |
| `data-pause-for` | On a button: the id of the `.eb` it pauses. It sets `aria-pressed` | none |

The strands are drawn with additive blending, so the glow reads best on a dark card.

## Do

- Use it on one card per screen, the one thing that is about to happen.
- Keep the card's text well inside its padding; the line swings about 6 px each way.

## Do not

- Put it on every card in a grid. A page of charged cards reads as noise.
- Speed it up into a flicker, or add flashes. Keep it to shape changes only.

## Reduced motion

One still frame of the line is drawn and nothing moves. Without the script a plain glowing border shows.
