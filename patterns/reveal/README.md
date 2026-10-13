# Scroll reveal

Motion tied to the scroll position, not to time: blocks rise in, images unveil and drift, and a bar tracks reading progress. It plays forward and back as the reader scrolls. No JavaScript where the browser supports scroll timelines.

[Live demo](https://motion.rujilabs.com/patterns/reveal/) · [style.css](style.css)

## Use

```html
<div class="reveal-progress"></div>
<section class="reveal">…</section>
<figure class="reveal-clip"><img src="cup.jpg" alt="…"></figure>
<figure class="reveal-parallax"><img src="beans.jpg" alt="…"></figure>
```

## Variants

| Class | What it does |
|---|---|
| `.reveal` | Rises in as it enters the viewport, eased so it settles |
| `.reveal-clip` | Unveils from the bottom edge up while it enters |
| `.reveal-parallax` | The first child moves slower than the page across the whole time the frame is in view (scaled 114% so no edge shows) |
| `.reveal-progress` | A fixed bar at the top of the page that fills as the reader scrolls. Colour from `color` |

## Browser support

Scroll timelines (`animation-timeline: view()`) run in Chromium browsers and are arriving elsewhere. Where they are missing:

- `.reveal` falls back to a one-time rise when the block enters the viewport. This needs [`play.js`](../../play.js), which watches every `.reveal`.
- `.reveal-clip` and `.reveal-parallax` show the image still.
- `.reveal-progress` stays hidden.

## Do

- Keep `animation-timeline` in its own declaration after the `animation` shorthand. The shorthand resets it, and some minifiers merge them so the animation never runs.
- Use `overflow: clip`, not `overflow: hidden`, on anything around a revealing element. `hidden` makes a scroll container and breaks the timeline.

## Do not

- Reveal the first screen. Content above the fold should be there on load.
- Parallax text. Only images and decoration.

## Reduced motion

Everything is still and visible. The progress bar keeps working: it moves only when the reader scrolls, and it reports position.
