# Lazy loading

Blur-up lazy images. Each picture waits on a placeholder made of its own main colours. When the frame nears the view, the real file loads, and once it has decoded it fades in from a blur and a slight zoom, so it seems to come into focus.

[Live demo](https://motion.rujilabs.com/patterns/lazy-load/) · [style.css](style.css) · [lazy.js](lazy.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="lazy-load/style.css">
<script src="lazy-load/lazy.js"></script>

<figure class="lazy ph-harbour">
  <img data-src="harbour.jpg" width="1200" height="780" alt="A red boat in the harbour">
  <noscript><img src="harbour.jpg" width="1200" height="780" alt="A red boat in the harbour"></noscript>
</figure>
```

```css
.ph-harbour { --lazy-ph: linear-gradient(#e7ddd0 55%, #5c86a8 60%); }
```

Give the frame a size (an `aspect-ratio`, or `width` and `height` on the image) so nothing jumps when the file arrives.

## Options

| Class, attribute or property | What it does |
|---|---|
| `.lazy` | The frame: placeholder, clip, and the blur-up when `.is-loaded` arrives |
| `--lazy-ph` | The placeholder: a colour or gradient. A tiny inline image works too |
| `--lazy-blur` | Starting blur, default `14px` |
| `img data-src` | Loaded only near the view. A plain `src` also works; it just blurs up once ready |
| `data-lazy-margin` | On an ancestor: how near the view loading starts, default `200px` |
| `data-lazy-delay` | On a frame: holds the reveal in ms. For demos and testing only |

## Do

- Pick the placeholder colours from the picture itself (sky, ground, subject). Two or three stops are enough.
- Keep the first picture above the fold as a normal `<img src>` with `fetchpriority="high"`; lazy load the rest.

## Do not

- Lazy load the hero image. It delays the largest paint the reader is waiting for.
- Use a grey box for everything. A placeholder in the right colours makes the swap feel like focus, not like a pop-in.

## Reduced motion

The loading light is hidden and the picture fades in briefly with no blur and no zoom.
