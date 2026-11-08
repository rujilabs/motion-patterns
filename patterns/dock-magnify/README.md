# Dock magnify

An app bar whose icons swell by their distance to the pointer: the nearest grows most, its neighbours less, and its label shows above it. Tab to an icon and it swells the same way.

[Live demo](https://motion.rujilabs.com/patterns/dock-magnify/) · [style.css](style.css) · [dock-magnify.js](dock-magnify.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="dock-magnify/style.css">
<script src="dock-magnify/dock-magnify.js" defer></script>

<nav aria-label="Portal">
  <div class="dock" data-dock-max="1.6" data-dock-reach="130">
    <a class="dock-item" href="#queue" aria-current="page">
      <svg viewBox="0 0 24 24" aria-hidden="true">...</svg>
      <span class="dock-tip">Queue</span>
    </a>
    <!-- more items -->
  </div>
</nav>
```

The label text is the link's name, so screen readers read it even while it is hidden. The script grows the real width of each item, so neighbours make room instead of overlapping. Keep the dock centred in its parent.

## Options

| Name | What it does | Default |
|---|---|---|
| `--dock-size` | Icon size at rest, in px | `44px` |
| `data-dock-max` | Scale of the icon right under the pointer | `1.6` |
| `data-dock-reach` | How far the swell spreads to each side, in px | `130` |
| `gap` on `.dock` | Space between icons | `8px` |

A finger dragged along the bar swells it too, and it settles 450 ms after the finger lifts. The bar keeps `touch-action: pan-y`, so the page still scrolls.

## Do

- Keep it to 5 to 8 icons. It is for the places someone goes to all day.
- Leave room above the bar for the grown icons and the label.

## Do not

- Do not use it as the only way to read what an icon means on touch: show the current page name on the page as well.
- Do not set `data-dock-max` above about 1.8: the bar starts to jump sideways.

## Reduced motion

Nothing grows. The label still shows above the icon under the pointer or with focus.
