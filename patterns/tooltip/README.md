# Tooltip

A small label for an icon button or a term. On hover it waits a moment, so a pointer crossing a toolbar does not set off a row of labels; on keyboard focus it shows at once. It fades in while moving 4px away from its anchor, toward the side it sits on, and leaves quicker with no wait.

[Live demo](https://motion.rujilabs.com/patterns/tooltip/) · [style.css](style.css) · [tooltip.js](tooltip.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="tooltip/style.css">
<script src="tooltip/tooltip.js" defer></script>

<div class="tip-group" role="toolbar" aria-label="Formatting">
  <span class="tip" data-side="bottom">
    <button type="button" aria-label="Bold" aria-describedby="tt-bold">B</button>
    <span class="tip-label" role="tooltip" id="tt-bold">Bold <kbd>Ctrl B</kbd></span>
  </span>
</div>
```

Style the label's colours and padding yourself. The pattern places, delays and moves it.

## Options

| Class, attribute or property | What it does |
|---|---|
| `.tip` | The anchor box: the button and its label |
| `.tip-label` | The label. Shows on hover after the wait, and at once on keyboard focus |
| `data-side` on `.tip` | `top` (default), `bottom`, `left`, `right`. The label moves out toward that side |
| `data-align` on `.tip` | `start` or `end`: for a top or bottom label near the page edge, line it up with that edge of the anchor instead of centring it |
| `--tip-delay` | Hover wait. Default `--dur-base` x .75 (450ms) |
| `--tip-gap` | Space between anchor and label. Default `8px` |
| `.tip-group` + `tooltip.js` | After one label has shown, the next shows with no wait for half a second |
| `tooltip.js` | Esc hides an open label until the pointer leaves or focus moves |

## Do

- Use it for a name or a shortcut that the icon cannot say. Keep it to a few words.
- Give the button its own `aria-label`; the tooltip adds to it, it does not replace it.

## Do not

- Put links, buttons or anything to click inside a tooltip. That is a popover.
- Use a tooltip as the only place an instruction lives. Touch screens never hover.

## Reduced motion

The label appears and disappears in place, with no movement and no fade. The hover wait stays, since it is not motion.
