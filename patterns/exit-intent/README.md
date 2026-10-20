# Exit-intent popup

A panel that drops in once, when a mouse leaves the page through the top edge, toward the tabs or the address bar. It drops from above because that is where the pointer went, and lifts back up when closed.

[Live demo](https://motion.rujilabs.com/patterns/exit-intent/) · [style.css](style.css) · [exit.js](exit.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="exit-intent/style.css">
<script src="exit-intent/exit.js"></script>

<dialog class="exit-panel" aria-labelledby="ex-h">
  <form method="dialog">
    <h2 id="ex-h">Before you go: take the term sheet</h2>
    ...
    <button value="send" data-exit-close>Email me the sheet</button>
    <button value="no" data-exit-close formnovalidate>No thanks</button>
  </form>
</dialog>
```

Style the panel yourself; the pattern only animates it. Read the choice from the dialog's `returnValue` in a `close` listener.

## Options

| Class or attribute | What it does |
|---|---|
| `dialog.exit-panel` | The panel. Opened with `showModal()`, so focus moves in, Esc closes it and the page behind is inert |
| `data-exit-delay` | Milliseconds on the page before it can trigger. Default `2000`, so a glance at the tabs on landing does not count |
| `[data-exit-open]` | A button that opens it on demand (the demo uses one, since a gallery frame has no address bar) |
| `[data-exit-close]` | A button that plays the close and then closes it, with its `value` as the return value |
| `--exit-scrim` | Backdrop colour |

It shows once per visit: a `sessionStorage` flag remembers it, and if storage is blocked it remembers until reload.

## Do

- Offer one useful thing, and make "No thanks" a real, equal button.
- Keep it to people with a mouse. On touch there is no exit to read, so the script never fires there.

## Do not

- Show it again after it was closed, or on every page of the visit.
- Use it to block leaving, or to ask "Are you sure?". That is a trap, not an offer.

## Reduced motion

The panel and the backdrop appear and disappear at once.
