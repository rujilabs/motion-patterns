# Horizontal scroll

The reader scrolls down and a row of panels slides sideways while the section holds still. When the last panel is in view, the section lets go and the page scrolls down again. No JavaScript.

[Live demo](https://motion.rujilabs.com/patterns/horizontal-scroll/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="horizontal-scroll/style.css">

<section class="hscroll" aria-label="Five stops">
  <div class="hscroll-frame">
    <span class="hscroll-progress"></span>
    <ol class="hscroll-track">
      <li>...</li>
      <li>...</li>
    </ol>
  </div>
</section>
```

Size the panels and the gap yourself. The row moves exactly as far as it overhangs the frame, so any number and width of panels works.

## Parts

| Class or property | What it does |
|---|---|
| `.hscroll` | The tall track and its view timeline (`--hscroll`) |
| `--hscroll-len` | Track height. Default `400svh`. Longer is slower sideways |
| `.hscroll-frame` | Sticks to the top, one screen tall, clips the row. A size container, so the row can use `cqw` |
| `.hscroll-track` | Moves from its start to `translateX(calc(-100% + 100cqw))` across `animation-range: contain` |
| `.hscroll-progress` | Scales from 0 to full width over the same range |

## Browser support

Scroll timelines run in Chromium browsers and are arriving elsewhere. Where they are missing, the row becomes a plain sideways scroller that snaps one panel at a time, and the track takes its natural height.

## Do

- Show a progress line or a counter. A page that stops moving down needs to say why.
- Give it about one screen of scrolling per panel or two. Shorter feels like the row is racing.

## Do not

- Hide content that matters only in the far panels. Some readers stop halfway.
- Put `overflow: hidden` on an ancestor of `.hscroll`: it breaks sticky and the timeline. Use `overflow: clip`.

## Reduced motion

Nothing is driven by the scroll. The row is a normal sideways scroller with snapping, and the page scrolls straight past it.
