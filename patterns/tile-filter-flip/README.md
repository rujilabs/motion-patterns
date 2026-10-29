# Tile filter flip

Use when: a grid of results changes under a filter, and you want people to see where the change came from.

A grid of tiles that turn over to show the new results. Every tile is a real card with two faces: the new result is written on the face turned away, then the card turns half a turn and lands with a small settle. The turns ripple out from the chip that was pressed: each tile waits in proportion to its distance from it, and tips away from it, about the axis at right angles to the line between them. A face darkens as it turns edge on and the tile comes toward you a little at that point, so it passes in front of its neighbours. Tiles that keep the same result do not move, and spare tiles turn to an empty face.

[Live demo](https://motion.rujilabs.com/patterns/tile-filter-flip/) · [style.css](style.css) · [tile-filter-flip.js](tile-filter-flip.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="tile-filter-flip/style.css">
<script src="tile-filter-flip/tile-filter-flip.js" defer></script>

<ul class="tile-flip" id="grid">
  <li class="tf-tile"><div class="tf-card"><div class="tf-face">
    <a href="/work/carpenter" data-key="carpenter">41 Carpenter Street</a>
  </div></div></li>
  <!-- one li per slot -->
</ul>
```

```js
// results: an array of DOM nodes, one per slot, null for an empty slot
grid.tileFlip(results, pressedChip);
```

The script adds the second face. Give each result node a `data-key`; a tile already showing that key stays still. The second argument is the origin of the ripple: an element, or `{ x, y }` in client pixels. The grid fires `tileflipend` when the last tile lands. Announce the new count in a `role="status"` line, as the demo does.

## Options

Set these on `.tile-flip`.

| Property | Does | Default |
|---|---|---|
| `--tf-turn` | How long one half turn takes, settle included | `680ms` |
| `--tf-spread` | Wait per 100 px of distance from the origin | `60ms` |
| `--tf-lift` | How far a tile comes toward you when it is edge on | `24px` |
| `--tf-min`, `--tf-gap` | Narrowest tile and the gap, for the default auto-fill columns | `150px`, `10px` |

An empty face gets the class `tf-empty`; style it as a quiet placeholder.

## Do

- Use it for a small grid that changes as a whole: portfolio filters, a product range by category, a menu by meal.
- Keep the faces flat and the same size. The turn reads as one card turning over, not as a layout change.

## Do not

- Flip a grid of more than about 24 tiles. The ripple gets long and the eye stops following it.
- Use it for sorting. When results only change order, move them instead (see [reorder](../reorder/)).

## Reduced motion

The faces swap at once. Nothing turns and nothing waits.

## See also

[card-flip](../card-flip/) turns one card on a button press; this turns a whole grid, with the stagger and the turning axis set by distance and direction from the control.
