# Ribbon cursor

Soft cloth ribbons tied to the pointer. Each one is a short rope with weight, so it trails behind a move, swings, twists over to show its darker back, and settles hanging down. When the pointer leaves, the ribbons glide back to a hook and come to rest there.

[Live demo](https://motion.rujilabs.com/patterns/ribbon-cursor/) · [style.css](style.css) · [ribbon-cursor.js](ribbon-cursor.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="ribbon-cursor/style.css">
<script src="ribbon-cursor/ribbon-cursor.js" defer></script>

<section class="rb" data-rb-hook="0.8 0.12">
  <canvas class="rb-canvas" aria-hidden="true"></canvas>
  <div class="copy">
    <h1>Hand-drawn batik, waxed and dyed over 9 days.</h1>
    <a href="/shop">Shop 37 new pieces</a>
  </div>
</section>
```

Give `.copy` `position: relative; z-index: 1`. The canvas is decoration only; the words and links stay in the HTML.

## Options

| Name | What it does | Default |
|---|---|---|
| `data-rb-hook` | Where the ribbons rest, x and y as parts of the area | `0.8 0.14` |
| `--rb-colors` | One colour per ribbon, space separated (4 ribbons) | Indigo, soga brown, madder red, turmeric |
| `--rb-width` | Width of a ribbon at its widest | `20px` |

Each ribbon is 20 points held at a fixed spacing, moved by gravity and damping 60 times a second (Verlet). A sideways swing twists it; where it has turned over, the back is drawn darker, and a dotted line runs down the middle like the fine dots drawn between batik motifs. The ribbons are shorter in a short area, so they fit a phone.

On first view they drop in from the top right once (1.1 s, on a Web Animations clock the gallery timeline can scrub). Tab to a link or button inside and they swing over to hang from it, so keyboard users see it too. On touch the area keeps `touch-action: pan-y`: a sideways drag pulls the ribbons, an up or down drag scrolls the page. The loop stops as soon as the ribbons are still, off screen, or in a hidden tab.

## Do

- Rest the hook in empty space, away from the text.
- Use colours from the product itself. Four is plenty.

## Do not

- Do not put it over a form or a long read: the ribbons cross whatever is under them.
- Do not make the ribbons much longer. Past about a third of the area's height they tangle.

## Reduced motion

The ribbons hang still from the hook, slightly draped. They do not follow the pointer or drop in.
