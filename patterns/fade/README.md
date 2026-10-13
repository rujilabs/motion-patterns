# Fade

Opacity only, on the slow duration (900ms). For images and backgrounds where movement would distract.

[Live demo](https://motion.rujilabs.com/patterns/fade/) · [style.css](style.css)

## Use

```html
<div class="fade-frame hero-photo">
  <img class="fade-settle" src="ridge.jpg" alt="Evening over two hills" width="1600" height="1000">
</div>
```

```css
.hero-photo { --fade-ratio: 16 / 10; --fade-bg: #f3d2ad; }  /* on the .fade-frame element */
```

## Variants

| Class | What it does |
|---|---|
| `.fade` | Fades in on load |
| `.fade-in` | Waits for `play.js` to add `.go`. Combine with `.fade-settle` for photos further down |
| `.fade-settle` | Fades while easing from 3% larger, so a photo reads as coming into focus |
| `.fade-frame` (parent) | Reserves the space with `--fade-ratio` and shows `--fade-bg` underneath, so there is no white flash and no layout shift |

## Do

- Pick `--fade-bg` from the image (its average colour). The fade then reads as the photo sharpening, not appearing.
- Use it for images below the fold, gallery items and decorative backgrounds.

## Do not

- Fade the page's main image (the Largest Contentful Paint element). It delays the moment the page looks ready.
- Fade text. If text must enter, use [rise](../rise/).

## Reduced motion

Every class drops its animation; the image shows at once.
