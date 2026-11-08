# Warp text

A line of text whose letters bulge toward the pointer, as if a lens were sliding along it. The letter under the pointer grows most, its neighbours less, and the rest of the line slides aside to make room, so nothing overlaps. Tab to a link in the line and the bulge moves to it.

[Live demo](https://motion.rujilabs.com/patterns/warp-text/) · [style.css](style.css) · [warp-text.js](warp-text.js)

## Use

```html
<link rel="stylesheet" href="warp-text/style.css">
<script src="warp-text/warp-text.js" defer></script>

<nav class="wt" data-warp aria-label="Stalls tonight">
  <a href="#satay">Satay</a>
  <a href="#apam">Apam Balik</a>
  <a href="#rojak">Rojak</a>
</nav>
```

The script splits the text into letters (aria-hidden, words never break) and keeps a visually hidden copy of each run of text, so screen readers read "Apam Balik", not letters. It reads the layout once (and again on resize), then each frame only writes transforms: the line never reflows, and the loop stops as soon as the letters settle.

A finger dragged along the line warps it too; the line keeps `touch-action: pan-y`, so the page still scrolls.

## Options

| Name | What it does | Default |
|---|---|---|
| `data-warp-max` | Scale of the letter right under the pointer | `1.6` |
| `data-warp-reach` | How far the bulge spreads, in px | `60` |
| `transform-origin` on `.wt-ch` | Where letters grow from; `50% 80%` keeps them near the baseline | `50% 80%` |

## Do

- Use it on one short line of big text: a set of links, a title, a sign.
- Give the lines room (`line-height` 1.4 or more), since swollen letters grow up and down too.

## Do not

- Do not warp body text or anything someone has to read while moving the pointer.
- Do not set `data-warp-max` above about 1.8: the line starts to jump sideways.

## Reduced motion

Nothing grows. The line stays as written.
