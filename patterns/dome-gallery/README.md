# Dome gallery

Use when: a collection is best browsed as a place, a room of works you stand in and look around, rather than a grid you scroll (a museum hall, a showroom, a portfolio wall).

The pictures hang on the inside of a dome in real CSS 3D, with you standing inside it. Drag to look around and, when you let go, it coasts to the nearest picture. Arrow keys turn one picture at a time, up and down change rows, and Enter (or a click on the picture in front) opens it large.

[Live demo](https://motion.rujilabs.com/patterns/dome-gallery/) · [style.css](style.css) · [dome-gallery.js](dome-gallery.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="dome-gallery/style.css">
<script src="dome-gallery/dome-gallery.js" defer></script>

<section>
  <div class="dg" tabindex="0" role="group" aria-roledescription="dome gallery"
       aria-label="Hall 2. Drag or use the arrow keys to turn, Enter opens the work in front of you."
       data-dg-cols="10" data-dg-pitch="12 -16">
    <div class="dg-sphere">
      <figure class="dg-tile" data-dg-note="Gold thread on silk, 184 by 92 cm.">
        <img src="songket.jpg" alt="Kain songket, Kuala Terengganu, 1932">
        <figcaption><b>Kain songket</b> <span>Kuala Terengganu, 1932</span></figcaption>
      </figure>
      <!-- data-dg-cols tiles per row, rows in order from the bottom -->
    </div>
  </div>
  <p aria-live="polite" data-dg-status></p>
  <div class="dg-open" role="dialog" aria-modal="true" aria-label="Opened work" hidden>
    <img src="" alt="">
    <p data-dg-caption></p>
    <p data-dg-note></p>
    <button type="button" data-dg-close>Back to the dome</button>
  </div>
</section>
```

Give `.dg` a size (the sphere is placed inside it). The status line names the picture in front ("Kain songket, Kuala Terengganu, 1932. Enter to open."), so the dome can be used without seeing it. The open panel gets the tile's image, a copy of its caption and its `data-dg-note`; Escape or the button closes it and focus goes back to the dome.

## Options

| Name | What it does | Default |
|---|---|---|
| `--dg-r` | Radius of the dome | `560px` |
| `--dg-z` | How far the dome sits toward the camera. Keep it below `--dg-r` so the camera is inside; close to `--dg-r` puts you near the middle | `360px` |
| `--dg-p` | Perspective | `600px` |
| `--dg-w`, `--dg-h` | Tile size | `150px`, `190px` |
| `data-dg-cols` | Tiles per row; each row is a full circle | `10` |
| `data-dg-pitch` | Height of each row in degrees, bottom row first; negative is above eye level | `10 -18` |

Odd rows sit half a tile over, like brickwork. Tiles more than 100 degrees from the view are hidden, so nothing is drawn from behind the camera. With a mouse you can drag up and down too; a finger drags sideways only, so the page still scrolls.

## Do

- Use 2 or 3 rows and 8 to 12 tiles per row. Fewer and the dome looks empty; more and the tiles get too small to read.
- Keep a real list of the works elsewhere on the page (or as the status line): the dome is the way in, not the only record.

## Do not

- Do not put links or buttons inside tiles. A tap on a tile turns to it, and a tap on the one in front opens it.
- Do not use it for things people compare side by side, such as prices. A flat grid does that better.

## Reduced motion

There is no turn into place when it first shows, turns from the keys and the open panel are instant, and a drag stops where you let go instead of coasting. Dragging still moves the dome, because it follows your hand.
