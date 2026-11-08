# Text cursor trail

A line of small drawn icons follows the pointer like beads on a string. The first chases the pointer, each next one is pulled along a fixed distance behind and turns to face the way it is going, so the line keeps its shape when the hand stops. Left alone for 2 seconds, the line walks a slow figure of eight on its own. Made for a children's picture book page.

[Live demo](https://motion.rujilabs.com/patterns/text-cursor-trail/) · [style.css](style.css) · [text-cursor-trail.js](text-cursor-trail.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="text-cursor-trail/style.css">
<script src="text-cursor-trail/text-cursor-trail.js" defer></script>

<svg hidden><symbol id="ico-star" viewBox="0 0 24 24">...</symbol></svg>

<article class="ctr" id="page" data-trail-gap="30">
  <ul class="ctr-set" aria-hidden="true">
    <li><svg><use href="#ico-star"/></svg></li>
    <!-- 5 to 12 icons -->
  </ul>
  <div class="words">...your text, with position: relative; z-index: 1...</div>
  <button type="button" data-pause-for="page" aria-pressed="false">Pause</button>
</article>
```

Draw the icons as inline SVG (not emoji, which look different on every phone). The line runs under the text: give the text `position: relative; z-index: 1`.

## Options

| Name | What it does | Default |
|---|---|---|
| `data-trail-gap` | Length of string between two icons, in px | `30` |
| `--ctr-size` | Size of each icon | `30px` |
| `data-pause-for` | On a button: the id of the `.ctr` whose idle walk it pauses. It sets `aria-pressed` | none |

Each icon is drawn 3.5% smaller than the one ahead, so the line tapers. A dragging finger leads the line too; the area keeps `touch-action: pan-y`, so the page still scrolls.

## Do

- Keep it to one playful area, such as a story page or a kids' activity hero.
- Use 6 to 10 icons. Fewer looks like a cursor, more looks like a snake.

## Do not

- Put it behind small or dense text. The icons pass under the words.
- Run it on a page where people fill in forms or read for long.

## Reduced motion

Nothing follows or walks. The icons stay as a still row at the top of the area. Without the script it is the same.
