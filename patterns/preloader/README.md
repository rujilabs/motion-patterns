# Preloader

A full-screen loading screen with a count and a thin progress bar. When loading ends the bar fills, the count and wordmark leave first, then the whole screen lifts away upward and the page underneath rises in.

[Live demo](https://motion.rujilabs.com/patterns/preloader/) · [style.css](style.css) · [preloader.js](preloader.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="preloader/style.css">
<script src="preloader/preloader.js"></script>

<div class="preloader" data-preloader data-preloader-min="800">
  <p><span class="preloader-count">0</span>%</p>
  <div class="preloader-bar" role="progressbar" aria-label="Loading the page"
       aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></div>
</div>
<main>
  <h1 class="preload-rise">Welcome</h1>
</main>
```

## Options

| Class, attribute or property | What it does |
|---|---|
| `data-preloader` (or `="auto"`) | Progress counts the page's images; finishes on window load |
| `data-preloader-min` | Shortest time on screen in ms, default `600`, so a fast load never flashes |
| `data-preloader="manual"` | Your code drives it: `el.preloader.set(0.4)`, `el.preloader.finish()`, `el.preloader.reset()` |
| `.preloader-count` | Gets the percent as text |
| `.preloader-bar` | The bar; fills from `--preload` |
| `.preload-rise` | Page elements that rise in as the screen clears. Space them with `--preload-i: 1, 2, 3...` |
| `--preloader-bg`, `--preloader-fg` | Screen colours |
| `--preloader-hold` | Pause in ms on 100% before the lift, default `450` |

## Do

- Use it only where the first view really needs everything at once, such as a portfolio of large images or a WebGL scene.
- Keep the minimum short. Under a second is plenty; people came for the page.

## Do not

- Put it in front of a page that renders fine as it streams in. A skeleton or nothing at all is faster to read.
- Fake progress in production. Tie `set()` to real work, or let the auto mode count images.

## Reduced motion

The bar and count still update, then the screen disappears at once without lifting, and the page shows in place.

## Without JavaScript

The screen only shows under `.js`, which `preloader.js` sets. Without it the page shows straight away.
