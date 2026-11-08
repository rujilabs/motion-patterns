# Drag deck

Use when: someone sorts a short list of choices one at a time (listings, candidates, swatches) and you want a yes or no on each, with a way back.

A stack of cards: drag or flick the top one right to keep it or left to skip it, and the cards underneath step up on a spring. A Keep or Skip stamp fades in as the card leans. Arrow keys and visible Keep, Skip and Undo buttons do the same, so nobody has to drag.

[Live demo](https://motion.rujilabs.com/patterns/drag-deck/) · [style.css](style.css) · [drag-deck.js](drag-deck.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="drag-deck/style.css">
<script src="drag-deck/drag-deck.js" defer></script>

<div class="deck" role="group" aria-label="Listings. Left arrow skips, right arrow keeps." tabindex="0">
  <ol class="deck-stack">
    <li class="deck-card">
      <h2>Residensi Bayu, Bangsar South</h2>
      <p>RM 2,350 a month</p>
      <span class="deck-stamp deck-stamp-keep" aria-hidden="true">Keep</span>
      <span class="deck-stamp deck-stamp-skip" aria-hidden="true">Skip</span>
    </li>
    <!-- more cards; the first is on top -->
  </ol>
  <div class="deck-actions" hidden>
    <button type="button" data-deck-skip>Skip</button>
    <button type="button" data-deck-undo disabled>Undo</button>
    <button type="button" data-deck-keep>Keep</button>
  </div>
  <p aria-live="polite" data-deck-status></p>
</div>
```

```js
deck.addEventListener("deck:choose", function (e) {
  // e.detail.card, e.detail.keep (true or false), e.detail.undo (true when a card came back)
});
```

The card's `h2` is read out in the status line ("Kept Residensi Bayu. 4 left."). An optional `[data-deck-end]` element gets "You kept 2 of 5" when the deck runs out.

## Options

| Name | What it does | Default |
|---|---|---|
| `--deck-step` | How far each card under the top one sits lower, in px | `12px` |
| `--deck-lean` | Set by the script while dragging, -1 (skip) to 1 (keep); style anything with it | `0` |
| Distance to throw | A third of the deck's width, or a quick flick of 24 px or more | |
| Keys on the deck | Right keeps, Left skips, Backspace undoes | |

Only the top three cards show; the rest wait, hidden, behind them. A drag that starts more up and down than sideways is left to the page, so the deck never traps a scroll on a phone (`touch-action: pan-y` on the cards).

## Do

- Keep the buttons. Dragging is the quick way, not the only way.
- Keep the deck short, 5 to 20 cards, and show what was kept somewhere the person can review.

## Do not

- Do not use it for choices that cannot be undone, such as deleting or paying.
- Do not put links or form fields on a card: a drag that starts on them is ambiguous.

## Reduced motion

Cards leave and come back at once with no throw, and the stack steps up without the spring. Dragging still follows the finger, because it is direct.
