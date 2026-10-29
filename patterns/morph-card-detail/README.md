# Card to detail morph

Use when: a grid of products or items opens one item in place, and people should keep track of which one they opened and where it lives in the grid.

Press a card and it grows into its detail view in the same spot on the page. Three parts carry over: the card's frame becomes the panel, its swatch or photo becomes the big one, and its name becomes the heading, all on one shared curve. The rest of the grid fades back while the detail's copy fades in. Back or Escape runs it the other way, so the card shrinks into its own slot and focus lands back on it. Where the browser has View Transitions it uses them; elsewhere it runs the same morph by hand, opening the panel from the card's rectangle with `clip-path` and flying the swatch from the card's swatch with a transform.

[Live demo](https://motion.rujilabs.com/patterns/morph-card-detail/) · [style.css](style.css) · [card-detail.js](card-detail.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="morph-card-detail/style.css">
<script src="morph-card-detail/card-detail.js" defer></script>

<div class="cd" id="paints">
  <ul class="cd-grid">
    <li><button class="cd-card" type="button" data-id="0">
      <span class="cd-chip"></span><span class="cd-name">Kunyit Muda</span>
    </button></li>
    <!-- more cards -->
  </ul>
  <section class="cd-detail" aria-labelledby="d-name">
    <span class="cd-chip"></span>
    <div>
      <button type="button" data-cd-close>Back to colours</button>
      <h2 class="cd-name" id="d-name" tabindex="-1"></h2>
      <!-- the rest of the detail -->
    </div>
  </section>
</div>
```

Fill the detail when a card opens. The event fires in the middle of the swap, so do it right away, not after a fetch:

```js
paints.addEventListener("card-detail", function (e) {
  if (!e.detail.card) return;            // null when it closes
  var item = items[e.detail.card.dataset.id];
  document.getElementById("d-name").textContent = item.name;
});
```

## Options

| Class, event or property | Does | Default |
|---|---|---|
| `.cd-card` | A card that opens. Use a `<button>` (or a link with a real detail URL) | |
| `.cd-chip` | The swatch or photo that carries over, in the card and in the detail | |
| `.cd-name` | The name that carries over and becomes the heading. Give the heading `tabindex="-1"`: focus goes there on open | |
| `[data-cd-close]` | Closes the detail | |
| `card-detail` event | On `.cd`, with `detail.card` (or `null` on close) | |
| `CardDetail.open(root, card)`, `CardDetail.close(root)` | Open or close from code | |
| `--cd-dur` | Length of the morph (also read by the View Transition) | `480ms` |
| `--cd-radius` | Corner radius of the frame while it moves | `10px` |

## Do

- Keep the detail in the same box as the grid, as here, so the page does not jump when it opens.
- Use one picture for the chip in both places (a flat colour or the same photo cropped). The morph only reads when the thing that grows is plainly the same thing.
- Give the detail a visible way back near the top, plus Escape.

## Do not

- Morph more than these three parts. Each extra moving piece of text is another thing to track, and price lines scaling up look like a bug.
- Fetch the detail before you swap. If the data is not ready, show the panel with its chip and name and fill the rest as it arrives.
- Use it for a full page change. Across documents, use a cross-document View Transition instead.

## Reduced motion

The grid and the detail swap at once. Focus still moves to the heading on open and back to the card on close.
