# Card nav

Use when: a small site has a dozen links in three groups, and the header should stay one slim bar until someone asks for the rest.

The bar grows downward into three link cards. The cards rise in one after another once the bar has started to open, and the two menu lines fold into an X. Nothing is measured: the panel opens from grid rows `0fr` to `1fr`.

[Live demo](https://motion.rujilabs.com/patterns/card-nav/) · [style.css](style.css) · [card-nav.js](card-nav.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="card-nav/style.css">
<script src="play.js"></script>
<script src="card-nav/card-nav.js" defer></script>

<nav class="cn" aria-label="Lantai Lima">
  <div class="bar">
    <button class="cn-toggle" type="button" aria-expanded="false" aria-controls="cn-panel">
      <span class="cn-lines" aria-hidden="true"></span> Menu
    </button>
    <a href="/">Lantai Lima</a>
  </div>
  <div class="cn-panel" id="cn-panel">
    <div class="cn-cards">
      <section class="cn-card" aria-labelledby="c1">
        <h2 id="c1">Spaces</h2>
        <ul><li><a href="/hot-desk">Hot desk, RM 35/day</a></li></ul>
      </section>
      <!-- two more cards -->
    </div>
  </div>
</nav>
```

`play.js` marks the page with `.js`; without it (or without the script) the cards show open under the bar, so every link is still there. Lay the cards out yourself on `.cn-cards` (a grid of three, one column on a phone).

## Options

| Name | What it does | Default |
|---|---|---|
| `--cn-dur` | How long the bar takes to open | `--dur-base` x .75 |
| `--stagger` | Gap between one card rising and the next | `80ms` |
| `CardNav.open(nav)`, `CardNav.close(nav)` | Open or close from a script, without moving focus | |

Opening from the button moves focus to the first link. Escape closes and puts focus back on the button; a click outside or Tab out of the nav closes it too.

## Do

- Keep it to three cards of three or four links: it is a short menu, not a site map.
- Give each card a heading so the groups read as groups.

## Do not

- Do not open it on hover: a pointer passing over the bar would push the page content under a panel.
- Do not put a form inside the cards: Tab out of the nav closes it.

## Reduced motion

The bar opens and closes at once with the cards in place, and the lines swap to the X without turning.
