# Pixel trail

The pointer leaves a trail of square pixels on a grid. Each one fades out in four hard steps, shrinking a little at each, like a sprite on an old palette. A fast move fills every cell in between, so the trail stays one solid line.

[Live demo](https://motion.rujilabs.com/patterns/pixel-trail/) · [style.css](style.css) · [pixel-trail.js](pixel-trail.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="pixel-trail/style.css">
<script src="pixel-trail/pixel-trail.js" defer></script>

<section class="px-trail" data-px-cell="16" data-px-life="850">
  <canvas class="px-canvas" aria-hidden="true"></canvas>
  <div class="copy">
    <h1>48 arcade cabinets and a teh tarik bar.</h1>
    <button type="button">Book a table for Friday</button>
  </div>
</section>
```

Give `.copy` `position: relative; z-index: 1` so the text sits above the pixels. The canvas is decoration only; everything that matters stays in the HTML.

## Options

| Name | What it does | Default |
|---|---|---|
| `data-px-cell` | Size of one pixel cell, in px | `16` |
| `data-px-life` | Time from lit to gone, in ms | `850` |
| `--px-colors` | Space separated colours, used three pixels at a time in turn | Pink, yellow, teal, blue |

When the area first comes into view a short run of pixels plays once (1.5 s). Tab to a button or link inside and a run streaks in from the left edge and underlines it, so keyboard users see the same thing. On touch the area keeps `touch-action: pan-y`: a sideways drag draws, an up or down drag scrolls the page.

At most 600 pixels are alive at once, from arrays made once. The canvas only redraws while a pixel is alive and stops when the area leaves the screen or the tab is hidden.

## Do

- Use it on a dark ground with bright colours: that is what makes the steps read as pixels.
- Keep the cell size between 12 and 24 px. Smaller looks like noise, larger like blocks.

## Do not

- Do not run it under body text people need to read. A hero line and a button or two is enough.
- Do not use it on a form or a checkout. A game, an arcade, a music or kids page suits it.

## Reduced motion

No trail follows the pointer and nothing plays on its own. One still trail is drawn along the bottom, already fading from left to right.
