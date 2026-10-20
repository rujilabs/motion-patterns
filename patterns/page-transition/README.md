# Page transition

One page replaces another with the View Transitions API. The old page leaves quickly, the new one rises in a beat later, and the shared parts, here the card's picture and its title, morph from their old place and size into the new page. Where the API is missing the new page still rises in.

[Live demo](https://motion.rujilabs.com/patterns/page-transition/) · [style.css](style.css) · [page-transition.js](page-transition.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="page-transition/style.css">
<script src="page-transition/page-transition.js"></script>
```

```js
pageTransition(() => { list.hidden = true; detail.hidden = false; }, {
  page: detail,
  shared: [
    { name: "pt-media", from: card.querySelector(".thumb"), to: hero },
    { name: "pt-title", from: card.querySelector(".title"), to: heading }
  ]
});
```

For a site with real pages, `style.css` already opts in with `@view-transition { navigation: auto; }`. Give the shared element the same `view-transition-name` on both pages.

## Options

| Name or class | What it does |
|---|---|
| `pageTransition(update, options)` | Runs `update` inside a view transition; returns a promise for the end |
| `shared: [{ name, from, to }]` | Elements that morph. Names are set only during the swap, so a list of cards never holds two at once |
| `page` | The page that appears; gets `.pt-in` where the API is missing |
| `pt-media` | Name for a picture that changes shape: it crops (`object-fit: cover`) instead of stretching |
| `::view-transition-group(*)` | Every morph: `--dur-base` on `--ease-inout` |

## Do

- Morph one or two things the reader was looking at: the picture they tapped, its title. Let everything else crossfade.
- Move focus to the new page's heading, and back to the card on return.

## Do not

- Give the same `view-transition-name` to two visible elements at once: the browser skips the whole transition.
- Morph text between very different sizes and line lengths. It works best when the words stay on one line.

## Reduced motion

The page swaps at once: no crossfade, no morph, no rise.

## Browser support

Same-page view transitions run in Chrome 111, Edge 111, Safari 18 and Firefox 144 and later. Others get the rise-in fallback.
