# Stamp collage

A stamp dealer's felt board. An airmail cover, a postcard and four perforated stamps are pressed onto the felt one after another: each falls, squashes on contact and settles at its own tilt while its shadow pulls in tight. A postmark is struck across the cover, Sold is stamped on the hibiscus, and the price stickers pop on. Then every scrap can be picked up, swung around and put down somewhere else.

[Live demo](https://motion.rujilabs.com/templates/stamp-collage/) · [index.html](index.html) · [style.css](style.css) · [collage.js](collage.js)

Built from [stamp](../../patterns/stamp/) (the `stamp` and `stamp-ink` keyframes) and [pop](../../patterns/pop/) (the stickers). Copy CSS in the gallery gives one file with tokens, both patterns and this template.

## Use

```html
<link rel="stylesheet" href="bundle.css">
<script src="play.js"></script>
<script src="collage.js" defer></script>
```

Each scrap is an `li.scrap` holding one SVG (`.face`), plus its own seal and sticker, so they travel with it. Position, size and tilt come from four custom properties on a class: `--l`, `--t` (percent of the board), `--w` (in `cqw`, hundredths of the board width) and `--tilt`.

## What moves and when

| Time | What moves |
|---|---|
| 0 to 1.5s | Scraps land 160ms apart: fall (ease-in), squash to 96%, settle at their tilt. The shadow starts long and faint and pulls in tight on contact |
| 1.3s | The postmark is struck across the cover's stamp (multiply ink, from 1.6x with a blur) |
| 1.6s | Sold is stamped on the hibiscus |
| 1.8 to 2.8s | Price stickers pop on, one by one, on the spring token |
| On drag | The scrap lifts (larger, longer shadow), swings with the drag speed and squashes a little when it is put down |

## Perforations

The stamps are SVG with one shared `<mask id="sc-perf">`: half holes punched every 8 units along all four edges. Because they are real holes, the felt and the scraps underneath show through, and the CSS `drop-shadow()` on the scrap follows every one.

## JS notes

`collage.js` (about 2 KB gzipped) uses pointer events with pointer capture, so a drag that leaves the board still ends cleanly. It writes `--x` and `--y` in `cqw` with `style.setProperty`: a moved scrap keeps its place on the board when the board resizes. While lifted, `--spin` follows the drag speed and eases back on `requestAnimationFrame`; the loop stops on drop. The drop squash is a Web Animation on `scale`, with its duration and curve read from `tokens.css`, so the CSS entrance on `transform` is never swapped out and replayed. Moving uses the individual `translate`, `rotate` and `scale` properties, which add to the tilt instead of replacing it. Scraps stay inside the board.

**Keyboard:** each scrap is focusable. Arrow keys move it (Shift for bigger steps), Escape puts it back. Tab always moves on, so nothing traps focus. Once anything has moved, a "Tidy the board" button sends every scrap home.

## Make it yours

- **Items:** copy an `li.scrap`, give it a class with `--l`, `--t`, `--w` and `--tilt`, and a delay in the choreography block.
- **Seals:** `.postmark` and `.sold` use multiply blending, so put them on light paper. `role="status"` on Sold makes screen readers announce it.
- **Stickers:** `.sticker` (orange) or `.sticker.st-y` (yellow). Each keeps a hidden "Price" label for screen readers.

## Reduced motion

Everything is in place from the first frame: scraps at their tilt, inks and stickers on. Dragging still works (it is the reader's own movement), but without the swing, the lift or the squash.

## Without JavaScript

The finished board. Every entrance is written under `.js`, which `play.js` sets; nothing can be dragged.
