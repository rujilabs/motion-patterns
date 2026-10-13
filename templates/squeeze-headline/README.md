# Squeeze headline

A kinetic shop hero: the headline squeezes from wide to condensed, an underline draws as it settles, the copy and button rise in after, and a category band loops below with a pause toggle.

[Live demo](https://motion.rujilabs.com/templates/squeeze-headline/) · [index.html](index.html) · [style.css](style.css)

Built from [stretch-squeeze](../../patterns/stretch-squeeze/), [draw](../../patterns/draw/), [rise](../../patterns/rise/), [marquee](../../patterns/marquee/) and [pop](../../patterns/pop/). Copy CSS in the gallery gives one file with tokens, every pattern and this template.

## Timing

| Time | What moves |
|---|---|
| 0 to 1.6s | Three headline lines settle from 150% to 62% width, 160ms apart |
| 1.1s | The underline starts drawing (1.6s) |
| 1.3s, 1.4s | The lede, then the button, rise in |
| Always | The category band loops; hover, focus or the Pause toggle stops it |

The headline is readable from the first frame; only its width changes.

## Make it yours

- **Font:** any variable font with a width axis. Preload it (see the `<head>`), or the first squeeze plays on a fallback font.
- **Copy:** keep each headline line to two or three short words; condensed caps need short lines.
- **Accent:** one colour (`#d9480f` here) for the highlighted word, the underline and focus rings.

## Reduced motion

The headline shows condensed, everything else is in place, and the band wraps its categories onto as many lines as needed.
