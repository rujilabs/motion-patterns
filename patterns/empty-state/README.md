# Empty state

What a list shows when it has nothing in it. The picture comes down a short way and lands with a slight give while its shadow grows, one accent springs in, a few strokes draw on, and the message and the action rise after the picture. About 1.5 seconds, and calm: an empty list is often good news.

[Live demo](https://motion.rujilabs.com/patterns/empty-state/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="empty-state/style.css">

<div class="empty" role="status">
  <svg class="empty-art" viewBox="0 0 200 130" aria-hidden="true">
    <ellipse class="empty-shadow" cx="100" cy="118" rx="58" ry="6"/>
    <path d="..."/>                                  <!-- the object -->
    <g class="empty-pop">...</g>                     <!-- one accent -->
    <path class="empty-draw" pathLength="1" d="..."/> <!-- a few strokes -->
  </svg>
  <h2>Nothing left for today</h2>
  <p>Tasks you add will show up here.</p>
  <button type="button">Add a task</button>
</div>
```

The picture is the first child; every child after it rises in order.

## Parts

| Class | What it does |
|---|---|
| `.empty` | Plays when shown: on load, or whenever it goes from `hidden` to shown (a `display: none` element restarts its animations) |
| `.empty-in` | The same, held until [`play.js`](../../play.js) adds `.go`, for an empty state further down the page |
| `.empty-art` | Comes down 16px and lands on `--ease-paper` over `--dur-slow` |
| `.empty-shadow` | Grows from half width as the object lands |
| `.empty-pop` | Springs in from 40% just after the landing |
| `.empty-draw` | Strokes with `pathLength="1"` that draw on last |
| children after the picture | Rise one `--stagger` apart, starting before the picture has settled |

## Do

- Say what the list is for and give the one action that fills it.
- Use `role="status"` on the container when the list empties in front of the reader, so the message is announced.

## Do not

- Play it on an empty search result the reader is typing into. It would replay on every key; show the message still.
- Animate a big illustration. The picture should be small next to the words.

## Reduced motion

Everything shows in its final place at once, strokes drawn.
