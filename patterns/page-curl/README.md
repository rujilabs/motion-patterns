# Page curl

The top page peels away from its bottom right corner and turns over, showing the next page under it. A straight fold at 45 degrees travels from the corner to the top left: what is past the fold is cut from the page and drawn again as the back of the paper, mirrored across the fold, with a dark crease, a light band where the paper bends and a soft shadow on the page below.

[Live demo](https://motion.rujilabs.com/patterns/page-curl/) · [style.css](style.css) · [curl.js](curl.js)

## Use

`.curl-stack` is a size container: give it a width and a height, or a width and an `aspect-ratio`. Put the pages in it, then one `.curl-flap` with one empty child.

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="page-curl/style.css">
<script src="page-curl/curl.js"></script>

<div class="curl-stack" id="pages" data-curl>
  <article class="is-current">January</article>
  <article>February</article>
  <div class="curl-flap" aria-hidden="true"><span></span></div>
</div>
<button type="button" data-curl-go="prev" aria-controls="pages">Back</button>
<button type="button" data-curl-go="next" aria-controls="pages">Next</button>
```

Each page needs its own solid background: the page under it shows through wherever the top page is cut.

## Options

| Class or property | What it does |
|---|---|
| `.is-top`, `.is-under` on pages, `.is-turning` on the stack | The page that turns, the page it shows, and the move itself. `curl.js` sets them |
| `.curl-back` on the stack | Plays it backwards: the previous page lays itself back down over the current one. What `prev` uses |
| `--curl-dur` | Length of the turn. Default 1.2 times `--dur-slow` (1080ms) on `--ease-inout` |
| `--curl-back` | Colour of the back of the paper. Default `#ece7dd`; set a darker one for a dark theme |
| `--curl-s` | Where the fold crosses the diagonal, as x + y from the top left. Registered, so you can drive it yourself |

The stack fires a `curlchange` event with the new index after each turn.

## Do

- Use it where the content is paper: a calendar, a notebook, a book, a menu.
- Give the pages a margin of table colour or a border, so the cast shadow has an edge to land on.

## Do not

- Use it for app navigation. A page turn is slow and decorative next to a push or a crossfade.
- Turn pages with a lot of fine text while the reader is in them: the fold cuts through lines.

## Reduced motion

`curl.js` swaps the pages at once, and the CSS drops the animation, the cut and the flap, so the next page is simply there.

## Browser support

Needs `@property` and container query units (all current browsers). Without them the page swaps with no curl.
