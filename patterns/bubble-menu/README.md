# Bubble menu

Use when: a small shop site on a phone has five or six destinations and one round menu button, and opening it should feel like the button itself opening up.

A wash spreads out of the button as a growing circle, and the links pop out of the button as round bubbles, each on the spring and a beat after the last. Closing pulls them back into the button. The plus on the button turns into an X.

[Live demo](https://motion.rujilabs.com/patterns/bubble-menu/) · [style.css](style.css) · [bubble-menu.js](bubble-menu.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="bubble-menu/style.css">
<script src="play.js"></script>
<script src="bubble-menu/bubble-menu.js" defer></script>

<nav class="bm" aria-label="Teratai Petal House">
  <button class="bm-toggle" type="button" aria-expanded="false" aria-controls="bm-list">
    <span class="bm-mark" aria-hidden="true"></span><span class="visually-hidden">Menu</span>
  </button>
  <ul class="bm-list" id="bm-list">
    <li><a class="bm-bubble" href="/bouquets">Bouquets</a></li>
    <!-- more bubbles -->
  </ul>
</nav>
```

Give `.bm-list` a size and lay the bubbles out in it yourself (a centred flex wrap works); round them with `aspect-ratio: 1` and `border-radius: 50%`. The script measures where each bubble sits and where the button is, so they grow out of the button wherever you put it, and it measures again when the list changes size. Without `play.js` and the script, the links are a plain list.

## Options

| Name | What it does | Default |
|---|---|---|
| `--bm-dur` | How long the bloom takes | `--dur-base` |
| `--bm-wash` | Colour of the wash that fills the list | white at 94% |
| `--stagger` | Step between bubbles (used at 70%) | `80ms` |
| `BubbleMenu.open(menu)`, `BubbleMenu.close(menu)` | Open or close from a script, without moving focus | |

Opening from the button focuses the first bubble. Escape closes and puts focus back on the button; a tap on the wash or Tab out of the menu closes it too.

## Do

- Keep it to 4 to 7 bubbles with one or two words each. A small line under the word (a price, a time) is fine.
- Vary the bubble sizes a little, biggest for the place most people go.

## Do not

- Do not use it for a long or nested menu: bubbles do not scan like a list.
- Do not put the button where the bloom has no room, such as a bar 40 px tall: the wash needs a real area to fill.

## Reduced motion

The wash and the bubbles appear and leave at once, with no bloom and no spring.
