# Reorder

A list that sorts and filters by moving. Rows that climb lift and pass in front of the rows they overtake, rows that drop slide behind, rows a filter removes fade where they stood while the list folds shut, and a number that changes rolls to its new value.

[Live demo](https://motion.rujilabs.com/patterns/reorder/) · [style.css](style.css) · [reorder.js](reorder.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="reorder/style.css">
<script src="reorder/reorder.js" defer></script>

<ol class="reorder" id="board">
  <li>...</li>
  <li>...</li>
</ol>
```

```js
const board = document.getElementById("board");

// Do the change inside the callback: sort with appendChild, filter with el.hidden.
reorder.flip(board, () => {
  rows.sort(byPoints).forEach((row) => board.appendChild(row));
  rows.forEach((row) => { row.hidden = row.dataset.rank > 4; });
});

// A number that changes: 1 rolls up (the new value comes from below), -1 rolls down.
reorder.roll(rankCell, "3", 1);
```

`flip` is FLIP: it measures every child, runs your change, then plays each child from its old place to its new one with the Web Animations API. Call it again before the last one finishes and every row starts from where it is on screen, so a quick second click never jumps.

## Options

| Piece | What it does | Change it with |
|---|---|---|
| Climbing row | Lifts (scale 1.03) at the middle of its trip, passes in front, shows a soft shadow at the top of the arc | `--reorder-shadow`, `--reorder-edge` |
| Dropping row | Shrinks a little (0.985) and dims to 72% at the middle, passes behind | |
| Trip length | `--dur-base` x 0.7 plus 0.9 ms per pixel, capped at 1.5 x `--dur-base`, on `--ease-out` | `--dur-base` |
| Removed row | Leaves the flow at once, fades and folds on `--ease-in` while the list shrinks to its new height | |
| Added row | Rises 12px into the gap a quarter beat after the others start | |
| `.roll` | Old value slides out, new one slides in, inside its own clipped box | |
| Row background | Rows need one, or the crossing shows through | `--reorder-bg` (default `Canvas`) |

## Do

- Keep the rows' height steady during the change. FLIP measures centres, so a row that changes height mid-trip will drift.
- Say what changed in a polite live region ("Sorted by points. Sungai Rusa first."). The movement is for eyes only.
- Keep it for lists of about 30 rows or fewer that the reader is looking at. Each row is one animation.

## Do not

- Put `transform` or `opacity` animations of your own on the rows: the moves use both and will replace them.
- Reorder while the reader is dragging or typing in a row. Move the list after they let go.
- Give `.reorder` a fixed height. It animates its own height when rows leave or arrive.

## Reduced motion

`flip` runs the change and returns: rows land in their new place in one frame, removed rows disappear and added rows appear. `roll` swaps the number. The lift shadow is switched off.
