# Popover

A richer panel tied to a button, on the native `popover` attribute. It springs open from the tip of its arrow, so it visibly grows out of the button, with one clear overshoot while the fade is already done. It opens above the button when there is no room below, keeps 12px inside the screen, and slides its arrow so it still points at the button.

[Live demo](https://motion.rujilabs.com/patterns/popover/) · [style.css](style.css) · [popover.js](popover.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="popover/style.css">
<script src="popover/popover.js" defer></script>

<button type="button" popovertarget="share">Share</button>

<div class="popover" id="share" popover aria-labelledby="sh-h">
  <h3 id="sh-h">Share Design review</h3>
  ...
  <button type="button" popovertarget="share" popovertargetaction="hide">Done</button>
</div>
```

Opening and closing need no script: `popovertarget` does it, a click outside or Esc closes it, and the panel sits in the top layer above everything. `popover.js` only places it. Style the paper, border and padding yourself; the arrow takes the same paper and edge.

## Options

| Class, attribute or property | What it does |
|---|---|
| `.popover` with `popover` | Springs open from the arrow tip, closes on ease-in |
| `data-side="top"` | Opens above the button. `popover.js` sets it when there is no room below |
| `--pp-width` | Panel width. Default `300px`, never wider than the screen minus 24px |
| `--pp-gap` | Space between the button and the panel. Default `12px` |

## Do

- Use it for a small task next to its button: sharing, a date, a short form.
- Close it with a clear button inside too. Not everyone knows that a click outside will do it.

## Do not

- Spring a large panel. The overshoot reads well on small things and wobbles on big ones.
- Use a popover for a label that only names a button. That is a tooltip.

## Reduced motion

The panel appears and disappears at once, with no scale or fade.

## Browser support

The `popover` attribute works in every current browser. The spring enter needs `@starting-style`, the exit fade needs `overlay` with `allow-discrete` (Chrome 117, Safari 17.5); elsewhere it opens and closes at once.
