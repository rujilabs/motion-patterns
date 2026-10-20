# Bottom sheet

A sheet that rises from the bottom edge to a half detent, with a grip you can drag. Let go and it settles on the nearest detent (half or full), or closes if it was pulled well down. A quick flick travels further than a slow pull of the same length, and the settle lands with a slight overshoot, like something set down.

[Live demo](https://motion.rujilabs.com/patterns/bottom-sheet/) · [style.css](style.css) · [sheet.js](sheet.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="bottom-sheet/style.css">
<script src="bottom-sheet/sheet.js" defer></script>

<button type="button" data-sheet="stops">Stops near you</button>

<dialog class="bottom-sheet" id="stops" aria-labelledby="st-h">
  <button class="bottom-sheet-grip" type="button" aria-label="Expand to full"><span class="bar"></span></button>
  <h2 id="st-h">Stops near you</h2>
  ...
</dialog>
```

Style the grip bar and the sheet's paper yourself. The pattern moves the sheet and handles the drag.

## Options

| Class, attribute or property | What it does |
|---|---|
| `.bottom-sheet` on `<dialog>` | Rises from the bottom over a scrim; Esc and a scrim click close it |
| `data-stop="half"` / `"full"` | The detent. Half shows the top 50% of the sheet. `sheet.js` keeps it in sync |
| `.bottom-sheet-grip` | Drag it to move the sheet; click, Enter or Space switch half and full |
| `--bs-h` / `--bs-w` | Sheet height (default `88%` of the viewport) and largest width (`560px`) |
| `--bs-in` / `--bs-out` | Default 450ms on `--ease-paper` to a detent, 250ms ease-in to close |

## Do

- Put the most useful rows at the top. At half, only the top half of the sheet is on screen.
- Keep a visible way to close it besides dragging: the scrim, Esc, or a button.

## Do not

- Use a bottom sheet on a wide desktop layout. There, a popover or a drawer fits the screen better.
- Add more than two or three detents. Each one is a place the sheet can stop when the reader did not mean it to.

## Reduced motion

The sheet appears and disappears at once and jumps between detents. Dragging does not move it live; on release it still picks the detent the drag pointed at.

## Browser support

The rise uses `@starting-style`, and the close keeps the sheet visible with `overlay` and `display` transitions (`allow-discrete`). Without them the sheet opens and closes at once; the drag and detents work everywhere pointer events do.
