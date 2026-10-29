# Drum rolodex

Use when: a contact or supplier list should be flipped through card by card, by scrolling or by typing the first letter of a name.

A rotary card file in 3D. Every card hangs on one axle by its bottom edge: it turns with `rotateX` about a point under the card. The open card stands upright in a gap, the cards after it lean back a few degrees apart so their letter tabs peek over the top in order, and the cards before it have fallen forward into the wire stand, where their edges stack up behind the front rail. Scroll, drag or flick and the cards flip over the drum one by one, with momentum, and land on a card. Type a letter and the drum spins to the first name with it. Each face is shaded by the angle to a light above the desk, and the deeper a card sits in the stack, the less light reaches it. The knobs on the axle turn with the drum.

[Live demo](https://motion.rujilabs.com/patterns/drum-rolodex/) · [style.css](style.css) · [drum-rolodex.js](drum-rolodex.js)

## Use

```html
<link rel="stylesheet" href="drum-rolodex/style.css">
<script src="play.js"></script>
<script src="drum-rolodex/drum-rolodex.js" defer></script>

<div class="rdx" role="listbox" tabindex="0" aria-label="Supplier cards, type a letter to jump">
  <ol class="rdx-list">
    <li class="rdx-card" role="option" id="c-ah-keong" data-key="Ah Keong Paint Supply">
      <div class="rdx-front">Ah Keong Paint Supply, Lim Keong Wah, 03-3341 2287</div>
      <div class="rdx-back"></div>
    </li>
    <!-- one li per card, sorted by data-key; li.is-on is the card it opens on -->
  </ol>
  <span class="rdx-knob rdx-knob-l" aria-hidden="true"></span>
  <span class="rdx-knob rdx-knob-r" aria-hidden="true"></span>
  <span class="rdx-base" aria-hidden="true"></span>
</div>
```

```js
const file = document.querySelector(".rdx");
file.addEventListener("change", () => show(file.rolodex.index)); // came to rest on a new card
file.rolodex.letter("K");                                           // spin to the first K
file.rolodex.go(0);                                                 // spin to the first card
```

The open card is the listbox's `aria-activedescendant`, with `aria-selected="true"`. Without the script the cards are a flat list that scrolls.

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-key` on a card | What typing matches, and what the cards should be sorted by | Its text |
| `li.is-on` | The card it opens on | The first |
| `--rdx-w`, `--rdx-h` | Card size. The file's size follows | `300px`, `158px` |
| `--rdx-hole` | How far under the cards the axle runs | `16px` |
| `--rdx-knob` | Size of the axle knobs | `42px` |
| `--rdx-card`, `--rdx-back`, `--rdx-metal` | Card front, card back, stand and knobs | Ivory, cream, dark grey |

The fan is set at the top of `drum-rolodex.js`: `GAP` (the open card's lean, 15 degrees), `FAN` (5.5 degrees between the cards behind), `FALL` and `STACK` (how the fallen cards lie). Only the top six fallen cards are drawn, and the file clips at its foot.

| Input | Does |
|---|---|
| Mouse wheel, trackpad | One card per notch, or free with a snap. At the first or last card the page scrolls on |
| Drag down or up, flick | Pulls the cards over toward you or back, then glides and lands on a card |
| Letters | Spin to the first name with that start. The same letter again goes to the next one |
| Arrow Down or Up, Page Down or Up, Home, End | Next or previous card, five cards, first, last |

## Do

- Sort the cards by the same key that typing matches, or the letter jump will land in odd places.
- Put a letter tab on the first card of each letter, and step the tabs left to right through the alphabet (the demo uses one small step per letter), so the tabs peeking over the top read in order.
- Give touch users the letters too. The demo has an A to Z row under the file.

## Do not

- Use it for hundreds of contacts. Past about 50 cards, a search box wins.
- Put long text on a card. A card holds what fits on an index card: a name, a number, one note.

## Reduced motion

A flick, key, wheel notch or letter puts the file straight on the new card: nothing spins. A drag still follows your hand.
