# Scroll expand media

A hero photo starts as a framed picture in the middle of the screen and opens out to full bleed as the page scrolls. The section is pinned while it plays: the frame's clip widens to the screen edges, its corners straighten, and the photo inside settles from a slight zoom, so it feels like stepping up to a window. Then a caption rises in. For a resort, venue or property page where the view is the product.

[Live demo](https://motion.rujilabs.com/patterns/scroll-expand-media/) · [style.css](style.css) · [scroll-expand-media.js](scroll-expand-media.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="scroll-expand-media/style.css">
<script src="scroll-expand-media/scroll-expand-media.js" defer></script>

<section class="se">
  <div class="se-pin">
    <figure class="se-media">
      <img src="bay.jpg" alt="The bay at dusk, three water chalets on stilts">
    </figure>
    <div class="se-caption">
      <h1>26 water chalets on Teluk Senja</h1>
    </div>
  </div>
</section>
```

Put the section at the top of the page, so the frame starts small the moment the page opens. The demo photo is a drawn SVG; use a real photo at least as wide as the screen.

## Options

| Property on `.se` | What it does | Default |
|---|---|---|
| `--se-x`, `--se-y` | How far the frame starts in from the sides and from top and bottom | `22%`, `20%` |
| `--se-round` | Corner radius of the starting frame | `18px` |
| `--se-zoom` | Starting zoom of the photo inside the frame | `1.16` |
| `--se-length` | Height of the section. Longer is a slower open | `260vh` |
| `--se-end` | Share of the pinned scroll the open takes; the caption follows | `60%` |

The demo starts the frame nearer the edges on a phone (`--se-x: 10%`), so the photo is not a sliver.

## Browser support

Chromium browsers run it on a CSS view timeline with no script. Elsewhere the script runs the same keyframes with the Web Animations API and sets their time from the scroll.

## Do

- Use one per page, as the opening.
- Keep anything you must read (prices, the booking button) out of the pinned part, or in the caption.

## Do not

- Make `--se-length` much longer than 300vh. People feel stuck when the page does not move for long.
- Put two of these in a row.

## Reduced motion

The section is one screen tall and the photo is full bleed from the start, caption showing. Without scroll timelines or the script it is the same.
