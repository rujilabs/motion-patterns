# Shredder

Use when: deleting a draft (an invoice, a quote, a form) should feel final, and the person still gets a few seconds to take it back.

The document slides down into a shredder head at a steady feed, the head hums, and below it the page comes out as strips. The strips are copies of the real document, each clipped to a narrow band, so the numbers and the DRAFT stamp you saw are the ones you see cut up. They part a little, curl as they hang, and drop into a basket with their tops left showing over the rim. Undo plays the same move backwards, faster: the strips rise, join under the head and the document comes back up whole. The doc and every strip run on one timeline length, so in reverse they stay joined at the slot.

[Live demo](https://motion.rujilabs.com/patterns/shredder/) · [style.css](style.css) · [shredder.js](shredder.js)

## Use

```html
<link rel="stylesheet" href="shredder/style.css">
<script src="shredder/shredder.js" defer></script>

<div class="shredder" data-strips="16">
  <div class="shredder-feed"><article class="shred-doc">...</article></div>
  <div class="shredder-head" aria-hidden="true"></div>
  <div class="shredder-out" aria-hidden="true"><div class="shredder-bin"></div></div>
</div>
```

```js
const machine = document.querySelector(".shredder");
confirmButton.addEventListener("click", () => machine.shredder.shred());
machine.addEventListener("shredded", showUndoToast);
undoButton.addEventListener("click", () => machine.shredder.restore());
machine.addEventListener("restored", focusDeleteButton);
```

Ask first, shred second: the demo swaps the Delete button for a "Shred it / Keep it" question, then shows an Undo toast with a 5 second bar that waits while the pointer is on it. Only send the real delete once the window closes.

## Options

| Name | What it does | Default |
|---|---|---|
| `data-strips` | How many strips the page is cut into | `14` |
| `--shred-out-h` | Height of the space under the head, where the strips hang and the basket sits | `180px` |
| `FEED`, `DROP` in the script | Ms to feed the page through, and for the strips to drop | `1700`, `650` |
| `.shredder-head`, `.shredder-bin` | The machine and the basket; restyle freely | Steel, grey |

`el.shredder.state` is `whole`, `going`, `gone` or `coming`.

## Do

- Keep the document short enough to feed in under two seconds. A long page means a long wait.
- Move focus somewhere sensible after each step: to the confirm button, to Undo, back to Delete.

## Do not

- Do not use it for deletes that cannot be undone. The show promises the paper is still in the basket.
- Do not shred on the first click. The confirm step is part of the pattern.

## Reduced motion

No feed and no strips: the document is gone at once, and back at once on undo. The `shredded` and `restored` events still fire.
