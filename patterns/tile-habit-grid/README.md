# Tile habit grid

Use when: a habit or streak tracker shows a whole year of days, and you want the year to read as something written in order.

A year of day tiles that fills in week by week. The empty grid is there from the start, so nothing jumps. When it scrolls into view, each done day's colour springs out from the middle of its tile, one week after the next and Monday to Sunday inside each week, so the eye follows the year from January to today. Darker means more. Days still to come are outlines. On a phone the grid turns on its side: weeks run down the page and the fill runs with them.

[Live demo](https://motion.rujilabs.com/patterns/tile-habit-grid/) · [style.css](style.css) · [tile-habit-grid.js](tile-habit-grid.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="tile-habit-grid/style.css">
<script src="play.js"></script>
<script src="tile-habit-grid/tile-habit-grid.js" defer></script>

<div class="habit-grid" data-play data-start="2026-01-01" data-days="365"
     data-levels="2224220314423322..."
     role="img" aria-label="2026 so far: goal hit on 231 of 302 days. Every day since 4 October.">
  <p class="hg-fallback">Goal hit on 231 of 302 days so far this year.</p>
</div>
```

`data-levels` holds one digit per day from `data-start`, 0 to 4. Days after the string ends are still to come. The script builds the tiles, the month names and the weekday labels, and hides `.hg-fallback`. The tiles are hidden from screen readers: write what the year says in `aria-label`, in words a person would use. Call `el.replay()` to fill it again.

## Options

Set these on `.habit-grid`.

| Property | Does | Default |
|---|---|---|
| `--hg-cell`, `--hg-gap` | Tile size and gap | `10px`, `3px` |
| `--hg-week` | Wait between one week and the next | `42ms` |
| `--hg-step` | Wait between days inside a week | `14ms` |
| `--hg-0` to `--hg-4` | Empty tile, then the four levels | Pale grey to deep teal |

At the defaults a year to late October fills in about 2.5 seconds. For a phone, switch the grid to rows of seven (see the demo's `page.css`): the delays stay right because they come from the week and weekday, not the position.

## Do

- Use one hue from pale to deep. Levels are amounts, so they should read as more and less of one thing.
- Pair it with two or three numbers that say the same thing in words: days hit, longest streak, this streak.

## Do not

- Fill it on a loop or on every visit to a tab. It plays once when it comes into view; give people a replay button.
- Use it for fewer than about eight weeks. A short run reads better as a list.

## Reduced motion

Every tile shows its colour straight away. Nothing springs and nothing waits.
