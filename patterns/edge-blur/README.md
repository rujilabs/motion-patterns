# Edge blur

A progressive blur where a scrolling list meets a sticky bar. Rows soften gradually as they slide under the header (or the footer), the way a lens loses focus, instead of being cut at a hard line.

[Live demo](https://motion.rujilabs.com/patterns/edge-blur/) · [style.css](style.css)

## Use

Put `.edge-blur` with four empty children inside the sticky bar. It hangs just outside the bar, over the list.

```html
<link rel="stylesheet" href="edge-blur/style.css">

<div class="list">                          <!-- the scroll container -->
  <header class="bar">                      <!-- position: sticky; top: 0; opaque background -->
    Lunch orders
    <div class="edge-blur" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
  </header>
  <ol>...rows...</ol>
  <footer class="bar">                      <!-- position: sticky; bottom: 0 -->
    RM 293.60
    <div class="edge-blur edge-blur-bottom" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
  </footer>
</div>
```

## Options

| Class or property | What it does |
|---|---|
| `--edge-blur-h` | Depth of the blur band. Default `48px`. Also the scroll distance over which it fades in |
| `--edge-blur-tint` | A colour washed in next to the bar, usually the bar's background. Default none |
| `.edge-blur-bottom` | For a footer: sits above the bar and blurs upward |

The four layers blur 1, 2, 4 and 8 px, each with a shorter mask, so the strongest blur sits right at the bar. In browsers with scroll timelines the band fades in over the first `--edge-blur-h` of scroll (and the bottom one fades out at the end), so a list at rest is never blurred.

## Do

- Give the bar an opaque background and a `z-index` above the rows.
- Keep the band shallow, 32 to 56 px. It should hint that more is under the bar, not hide a row.

## Do not

- Put `opacity`, `filter`, `mask` or `backdrop-filter` on `.edge-blur` or on the bar. Each one starts a new backdrop root and the layers blur nothing.
- Give the bar a border on the list side. The band starts at the bar's inner edge and blurs the line away; the blur is the divider.
- Stack it over text people still need to read, such as a form field just under a header.

## Reduced motion

Nothing here moves, so the blur stays. It is on at full strength from the start instead of fading in with the scroll.
