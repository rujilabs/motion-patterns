# Sticky header

A header that stays at the top of the page. Once the page scrolls it gets slimmer and gains a soft shadow; while the reader scrolls down it slides out of the way, and the moment they scroll up it comes back.

[Live demo](https://motion.rujilabs.com/patterns/sticky-header/) · [style.css](style.css) · [sticky.js](sticky.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="sticky-header/style.css">
<script src="sticky-header/sticky.js"></script>

<header class="sticky-header">
  <div class="sticky-row">
    <a class="sticky-logo" href="/">Selasar</a>
    <nav>...</nav>
  </div>
</header>
```

Lay out `.sticky-row` yourself (flex, a max width). Put the header first in `<body>` so `position: sticky` has the whole page to stick in.

## Options

| Class or property | What it does |
|---|---|
| `--sticky-h` | The header's height. Default `64px`. It never changes in the layout |
| `--sticky-shrink` | How far the background slims when scrolled. Default `.75` |
| `--sticky-bg`, `--sticky-line` | Background and bottom line colours |
| `.sticky-logo` | Scales to 86% when scrolled |
| `.is-scrolled` | Set by the script past 8px |
| `.is-hidden` | Set by the script on 6px or more of scrolling down, past twice the header's height. Leaves in 360ms on `--ease-in`, returns in 600ms on `--ease-out` |

## Why it is drawn, not laid out

Changing the header's real height while the page scrolls moves everything under it, and the browser's scroll anchoring can then bounce the page at the threshold. Here the header keeps its height; its background scales down from the top and the row moves up to the middle of the slimmer bar. Below the bar the header lets clicks through to the page.

## Do

- Bring it back on any upward scroll. A reader scrolling up is usually looking for the menu.
- Keep it visible when focus is inside it. The script does this for you.

## Do not

- Hide it on pages shorter than two screens. There is nothing to make room for.
- Hide it while a menu or search inside it is open.

## Reduced motion

The header slims and gains its shadow at once, and it never hides.
