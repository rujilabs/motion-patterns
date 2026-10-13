# Split-flap board

The departures board on a ferry pier. Every character is a split flap built in CSS 3D: the top half falls on a hinge at the split, darkening as it turns away from the light, and the bottom half follows it down, lands, bounces a little and settles. Cells rattle through the drum to their letters, row after row; the flap clock ticks, and every few seconds a remark changes (boarding, gate closed, delayed). A Pause toggle stops all of it.

[Live demo](https://motion.rujilabs.com/templates/split-flap-board/) · [index.html](index.html) · [style.css](style.css) · [board.js](board.js)

Built from [pulse](../../patterns/pulse/) (the boarding lamp) and [fade](../../patterns/fade/) (the column labels). Copy CSS in the gallery gives one file with tokens, both patterns and this template.

## Use

```html
<link rel="preload" href="fonts/anybody-vf.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="bundle.css">
<script src="play.js"></script>
<script src="board.js" defer></script>
```

The board is a real `<table>`. In each cell, `.flaps` holds one `span.c` per character (hidden from screen readers) and a `.sr-only` span says the value in words ("Delayed 15 minutes"). Field widths are fixed: time 5, destination 12, vessel 8, pier 2, remarks 10. Pad shorter values with spaces.

## What moves and when

| Time | What moves |
|---|---|
| 0 to 0.7s | The ferry pictogram sails in on the sign; the column labels fade up |
| 0.1 to 2.6s | Every cell starts 4 to 14 characters behind its letter and flips through the drum, 72ms a flip. Rows start 170ms apart, cells 26ms apart within a row. The last flip of each run is slower (70ms down, 190ms up) and bounces 16 degrees |
| 2.8 to 4.4s | A band of light runs once across the board's glass |
| From 3.2s | The clock ticks every second; every 7 seconds a remark changes |
| Always | The clock colon blinks and the boarding lamp beats; Pause stops both, and the ticking |

## The flap

Each `.c` gets four halves from `board.js`:

| Half | Shows | Does |
|---|---|---|
| fixed top `.u` | the next character | stays |
| fixed bottom `.d` | the current character | stays |
| top flap `.fu` | the current character | falls from 0 to -90 degrees on a hinge at its bottom edge (`transform-origin: 50% 100%`), brightness 1 to .42 |
| bottom flap `.fd` | the next character | comes down from 90 to 0 degrees on a hinge at its top edge, brightness .5 to 1 |

The cell has its own `perspective`, so each flap foreshortens around its own hinge. Halves use `backface-visibility: hidden` and a slightly lighter top colour than bottom, like a lit board.

## JS notes

`board.js` (about 3 KB gzipped) runs one `requestAnimationFrame` scheduler that starts each flip when it is due and stops when nothing is left to turn. Flips are Web Animations on `transform` and `filter`, with their curves read from `tokens.css` (`--ease-in` for the fall, `--ease-out` for the landing). Characters come from one drum (`" ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:.-"`), so a cell can only reach N by passing M, like the real thing; the clock cells use a digits-only drum so 9 turns straight to 0. The clock and the remarks run on a one-second interval that does nothing while Pause is checked.

## Make it yours

- **Rows:** add a `<tr>` with the same five cells. On short frames (under 560px tall) only the first five rows show.
- **Colours:** `--flap-top`, `--flap-bot` and `--flap-ink` on `.c`; `.amber`, `.red` and `.grey` on a cell recolour its flaps.
- **Remarks:** the `updates` list in `board.js` is row number, new text, tone.
- **Phones:** under 640px each departure is two lines: the destination large, then time, remarks and pier. The vessel stays in the table for screen readers.

## Reduced motion

`board.js` does nothing: the board shows as written, the clock does not tick, nothing flips, the colon and the lamp are still. The Pause toggle is hidden because nothing moves.

## Without JavaScript

The same board as written: every character on its own two-tone tile with the split line across it.
