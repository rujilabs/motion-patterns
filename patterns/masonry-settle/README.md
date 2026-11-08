# Masonry settle

Gallery tiles of mixed heights drop into a masonry grid when it comes into view. Each tile falls from a little above with a slight tilt, lands a few pixels low and settles flat, one after another across the grid.

[Live demo](https://motion.rujilabs.com/patterns/masonry-settle/) · [style.css](style.css) · [masonry-settle.js](masonry-settle.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="masonry-settle/style.css">
<script src="play.js"></script>
<script src="masonry-settle/masonry-settle.js" defer></script>

<div class="masonry" data-play>
  <figure>...</figure>
  <figure>...</figure>
</div>
```

The layout is CSS columns, so each tile keeps its own height. The script numbers the tiles by where they land (top row first, then left to right), so the drop sweeps across the grid instead of down one column at a time. Without it the tiles drop in source order.

## Options

| Property on `.masonry` | What it does |
|---|---|
| `--masonry-n` | Most columns. Default `3` |
| `--masonry-w` | Narrowest a column may get before the grid drops a column. Default `150px` |
| `--masonry-gap` | Gap between tiles. Default `12px` |
| `--settle-drop` | How far above a tile starts. Default `56px` |
| `--stagger` | Delay between tiles (token, `80ms`) |

A `[data-replay]` button inside the same `.frame` drops the tiles again.

## Do

- Use it once, for the first view of a gallery or a portfolio. Twelve tiles or fewer, so the last one lands within about 2 seconds.
- Keep the tilt small. The tiles should look placed, not thrown.

## Do not

- Replay it on every filter change or page of results. Moving tiles there hide which ones actually changed.
- Rely on column order for meaning. CSS columns read top to bottom, then across; screen readers follow the source order.

## Reduced motion

The tiles are in place from the start. Nothing drops.
