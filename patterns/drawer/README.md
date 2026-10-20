# Drawer

An off-canvas panel that slides in from the side over a scrim, with its content arriving a beat after the edge. It slides back out faster than it came. Optionally the page moves a short way aside, so it reads as pushed rather than covered.

[Live demo](https://motion.rujilabs.com/patterns/drawer/) · [style.css](style.css) · [drawer.js](drawer.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="drawer/style.css">
<script src="drawer/drawer.js" defer></script>

<main class="drawer-shift">
  <button type="button" data-drawer="bag" aria-controls="bag" aria-expanded="false">Bag</button>
</main>

<dialog class="drawer" id="bag" aria-labelledby="bag-h">
  <form method="dialog">
    <h2 id="bag-h">Your bag</h2>
    <button aria-label="Close bag">Close</button>
  </form>
</dialog>
```

The drawer is a modal `<dialog>`, so Esc closes it, focus stays inside while it is open, and focus returns to the button after.

## Options

| Class or property | What it does |
|---|---|
| `.drawer` on `<dialog>` | Full-height panel on the right, slides in and out, with the scrim |
| `.drawer-left` | Opens from the left edge instead |
| `.drawer-shift` | On the page content: moves `--drawer-push` (48px) away from the panel and dims a little |
| `--drawer-w` | Panel width. Default `min(360px, 88vw)` |
| `--drawer-in` / `--drawer-out` | Default 360ms ease-out in, 240ms ease-in out |
| `--drawer-scrim` | Scrim colour when open |

## Do

- Use it for a task beside the page: a cart, filters, a settings list. The page is still there when it closes.
- Keep the shift small. Its job is to say "this came from here", not to move the page.

## Do not

- Use a drawer for the main navigation of a wide screen, where a visible menu costs nothing.
- Shift the page and also scale it. One cue is enough.

## Reduced motion

The panel, scrim and page shift appear and disappear at once, with no slide.

## Browser support

The enter uses `@starting-style` and the exit uses `overlay` and `display` transitions with `allow-discrete` (Chrome 117, Safari 17.5; Firefox 129 for the enter). `.drawer-shift` needs `:has()`. Without them the panel opens and closes at once.
