# Crossfade

Stacked frames that take turns, for hero photos, testimonials or before and after. Optional slow zoom, a pause toggle, and no background flash between frames.

[Live demo](https://motion.rujilabs.com/patterns/crossfade/) · [style.css](style.css)

## Use

```html
<section class="crossfade-group">
  <label class="crossfade-pause"><input type="checkbox"> Pause</label>
  <div class="crossfade crossfade-zoom" tabindex="0" role="group" aria-label="Three photos">
    <figure><img src="a.jpg" alt="…"><figcaption>…</figcaption></figure>
    <figure><img src="b.jpg" alt="…"><figcaption>…</figcaption></figure>
    <figure><img src="c.jpg" alt="…"><figcaption>…</figcaption></figure>
  </div>
</section>
```

## Timing

Each frame gets 4 seconds: a 1 second fade-in on top of the frame before, then a hold. The outgoing frame stays fully opaque until the incoming one has finished fading in, so the page background never shows through mid-change.

## Options

| Class | What it does |
|---|---|
| `.crossfade` | 3 frames, 12s cycle |
| `.crossfade-2`, `.crossfade-4` | 2 frames (8s) or 4 frames (16s) |
| `.crossfade-zoom` | The first child of each frame eases from 108% to 100% while it is on screen; captions stay still |
| `.crossfade-pause` inside `.crossfade-group` | A checkbox that pauses the frames |

Hover and keyboard focus pause it too.

## Do

- Include the pause toggle when the frames carry words. [WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) asks for a way to stop content that moves on its own for more than 5 seconds.
- Give every image its own `alt`; all frames stay in the page for screen readers.

## Do not

- Put the only copy of important information in frame 2 or later. Some people will never wait for it.
- Use more than 4 frames. Past that it is a carousel and needs real controls.

## Reduced motion

Only the first frame shows, without zoom, and the toggle hides.
