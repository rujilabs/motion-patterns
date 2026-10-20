# Modal dialog

A native `<dialog>` that scales up from 96% and fades in over a dimming backdrop, then leaves in about half the time it took to arrive. Slow enough in to be followed, quick out once the choice is made.

[Live demo](https://motion.rujilabs.com/patterns/modal/) · [style.css](style.css) · [modal.js](modal.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="modal/style.css">
<script src="modal/modal.js" defer></script>

<button type="button" data-modal="archive">Archive</button>

<dialog class="modal" id="archive" aria-labelledby="ar-h">
  <form method="dialog">
    <h2 id="ar-h">Archive this board?</h2>
    <button value="cancel" autofocus>Cancel</button>
    <button value="archive">Archive board</button>
  </form>
</dialog>
```

`dialog.returnValue` holds the `value` of the button that closed it. Style the box (paper, border, padding) yourself; the pattern only moves it.

## Options

| Class or property | What it does |
|---|---|
| `.modal` on `<dialog>` | Scale 96% to 100%, fade, and a 6px rise, plus the backdrop dim |
| `--modal-in` | Opening time. Default `--dur-base` x .45 (270ms), ease-out |
| `--modal-out` | Closing time. Default `--dur-quick` x .75 (150ms), ease-in |
| `--modal-scrim` | Backdrop colour when open. Default a 48% cool black |
| `data-modal="<id>"` + `modal.js` | Opens that dialog with `showModal()`; a click on the backdrop closes it |

## Do

- Open it only from a click or a key press. A dialog that appears on its own is an interruption.
- Put `autofocus` on the safe choice (Cancel) for destructive dialogs.

## Do not

- Animate the dialog in from far away or with a bounce. The eye should land on the words, not on the trip.
- Make the exit as long as the entrance. The choice is made; get out of the way.

## Reduced motion

The dialog and its backdrop appear and disappear at once, with no scale or rise.

## Browser support

The enter uses `@starting-style`, and the exit keeps the dialog visible with `overlay` and `display` transitions (`allow-discrete`): Chrome 117, Safari 17.5, Firefox 129 for the enter. Where the exit transition is not supported, the dialog closes at once.
