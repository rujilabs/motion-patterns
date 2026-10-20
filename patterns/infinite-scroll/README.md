# Infinite scroll

When the reader nears the end of a list, a small loader turns in the footer, then the next batch arrives one item after another. A Load more button stays in place for keyboards and for browsers without IntersectionObserver, and the end of the list is said out loud.

[Live demo](https://motion.rujilabs.com/patterns/infinite-scroll/) · [style.css](style.css) · [infinite.js](infinite.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="infinite-scroll/style.css">
<script src="infinite-scroll/infinite.js"></script>

<section data-infinite>
  <ul class="inf-list">…first page…</ul>
  <div class="inf-foot">
    <button class="inf-more" type="button">Load more</button>
    <span class="inf-loader" aria-hidden="true"></span>
    <p class="inf-end">You are all caught up.</p>
    <p class="inf-status" role="status"></p>
  </div>
</section>
```

```js
feed.addEventListener("infinite:load", async (e) => {
  const items = await fetchNextPage();          // your code
  e.detail.done(items.length ? items.map(render) : null);
});
```

## Parts

| Class or attribute | What it does |
|---|---|
| `[data-infinite]` | The section. Gets `aria-busy="true"` while loading and `data-end` at the end |
| `.inf-list` | New items are appended here |
| `.inf-foot` | Watched: loading starts when it comes within 80px of the view |
| `.inf-more` | Load more button: always works, hidden while busy and at the end |
| `.inf-loader` | A ring that turns while busy |
| `.inf-new` + `--inf-i` | Arrival: each item rises in one `--stagger` (80ms) after the last, capped at 8 steps |
| `.inf-status` | Live region: "Loading more", "4 more loaded", "You have reached the end" |

## Do

- Keep the footer and the end note: a reader needs to know whether the list really ended or is still loading.
- Put anything people need to reach (contact, legal links) above the list or in a side bar, not under it.

## Do not

- Use it for results people compare or return to, such as search or a shop listing. Pages with numbers let them find their place again.
- Animate more than one batch at a time. If the server is fast, the stagger is enough motion.

## Reduced motion

New items appear at once, and while loading the ring is replaced by the status text.
