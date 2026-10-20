# Pagination

Page numbers with one marker that slides to the current page. On a long jump it stretches: the edge that leads arrives first and the trailing edge follows a beat later, so the marker reaches toward the page you picked and then gathers itself under it.

[Live demo](https://motion.rujilabs.com/patterns/pagination/) · [style.css](style.css) · [pager.js](pager.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="pagination/style.css">
<script src="pagination/pager.js" defer></script>

<nav class="pager" data-pager aria-label="Pages">
  <button type="button" class="pager-prev" aria-label="Previous page">Prev</button>
  <ol class="pager-list">
    <li><button type="button" class="pager-page" aria-current="page">1</button></li>
    <li><button type="button" class="pager-page">2</button></li>
    <li><button type="button" class="pager-page">3</button></li>
    <li class="pager-mark" aria-hidden="true"></li>
  </ol>
  <button type="button" class="pager-next" aria-label="Next page">Next</button>
</nav>
```

Listen for the change and load the page:

```js
document.addEventListener("pager:change", (e) => loadPage(e.detail.page));
```

## Options

| Property or event | What it does | Default |
|---|---|---|
| `--pager-mark`, `--pager-on` | Marker colour and the number colour on it | `#1e2229`, `#fff` |
| `--pager-radius` | Marker corner radius | `8px` |
| `--pager-lag` | How far the trailing edge runs behind | `--stagger` |
| `pager:change` | Fires on `[data-pager]` with `detail.page`, counted from 1 | |

## Do

- Keep the marker behind the numbers (`z-index: -1` inside the list, which isolates).
- Show where the reader is in words too, such as "5 to 8 of 26".

## Do not

- Animate the page content in from the side as well. The marker already says which way you went.
- Use it for more than about 9 visible numbers; collapse the middle into a gap instead.

## Reduced motion

The marker jumps to the new page with no stretch.
