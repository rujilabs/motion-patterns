# Squeeze headline

A poster for a six-night track race, set in Anybody. Three lines (LEFT, TURNS, ONLY.) are each set at their own size so they end on the same right edge. They squeeze in from 150% width letter by letter on a spring, the track outline draws behind, three lane lines run out under the headline and the details rise in. After that, the letters nearest the pointer swell wider and heavier while the rest of the line gives way, so the block stays justified.

[Live demo](https://motion.rujilabs.com/templates/squeeze-headline/) · [index.html](index.html) · [style.css](style.css) · [scene.js](scene.js)

Built from [stretch-squeeze](../../patterns/stretch-squeeze/) (the font, the nav hover), [draw](../../patterns/draw/) (the track outline), [rise](../../patterns/rise/) (the details) and [marquee](../../patterns/marquee/) (the race band and its pause toggle). Copy CSS in the gallery gives one file with tokens, every pattern and this template.

## Use

```html
<link rel="preload" href="fonts/anybody-vf.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="bundle.css">
<script src="play.js"></script>
<script src="scene.js" defer></script>
```

Each letter is a `span.ch` inside a line `span.ln`; a hidden copy of the headline (`.sr-only`) is what screen readers read.

## What moves and when

| Time | What moves |
|---|---|
| 0 to 1.6s | Each line squeezes from 150% to 115% width (and 300 to 800 weight) on the spring token, 40ms per letter. LEFT and ONLY. close from the right, TURNS from the left |
| 0.16 to 1.9s | The track outline draws behind the copy |
| 1.0 to 1.9s | The measure, sprinter and stayer lines run out to the right edge |
| 1.2 to 2.1s | Date, venue, copy and buttons rise in |
| After | Letters near the pointer swell; the race band loops (hover, focus or Pause stops it) |

## Sizing

One unit, `--u`, is the TURNS line. LEFT is `1.529 * --u` and ONLY. is `1.25 * --u`: the ratios that make three lines of different length the same width in Anybody at wdth 115 and weight 800. Line heights are `.655 + .12 / size` (caps are .655em tall), which gives equal gaps between lines of different sizes. `--u` is bounded by both the column width and the frame height, so the poster fits a short gallery card as well as a tall phone. New words need new ratios: measure each line at 100px and divide.

## JS notes

`scene.js` (about 2.5 KB gzipped) starts once the entrance animations have finished (`getAnimations()` promises), so it never fights them. The entrance uses `animation-fill-mode: backwards` and keyframes with only a `from`, so when it ends each letter falls back to `var(--w)` and `var(--g)`, which the script then drives with `style.setProperty`.

- **Swell:** each letter gets a Gaussian bump from its distance to the pointer (wider than tall, so a whole word reacts).
- **Keeping the length:** glyph widths are measured once in a hidden probe at eleven widths and two weights. For every pointer move, each line solves (by bisection) for the shift that brings it back to its resting length.
- **Kerning:** once neighbouring letters differ, the browser shapes each letter alone and drops kerning (LY, Y.). The solver matches unkerned widths to the kerned resting length, so the edge holds anyway.
- Values ease on `requestAnimationFrame`; the loop stops when they arrive. Leaving the window settles everything back to rest.

## Reduced motion

The poster shows set, every line at rest, the lane lines and details in place. The pointer does nothing. The race band stops and wraps its races onto a few lines without the separators.

## Without JavaScript

The same finished poster. Hidden start states (lane lines, details, track outline) are written under `.js`, which `play.js` sets.
