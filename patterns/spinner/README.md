# Spinner

Three indeterminate loaders that say "working" and nothing more: a ring whose arc stretches and shrinks as it turns, three dots that rise in turn, and a segment that crosses a bar. None of them fakes progress or slows down near an end.

[Live demo](https://motion.rujilabs.com/patterns/spinner/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="spinner/style.css">

<button type="button" aria-disabled="true">
  <svg class="spin-ring" viewBox="0 0 24 24" aria-hidden="true">
    <circle class="spin-track" cx="12" cy="12" r="9.5"/>
    <circle class="spin-arc" cx="12" cy="12" r="9.5" pathLength="100"/>
  </svg>
  <span role="status">Saving changes</span>
</button>

<span class="spin-dots" aria-hidden="true"><i></i><i></i><i></i></span>

<span class="spin-bar" aria-hidden="true"></span>
```

All three take `currentColor`. Always put the words next to them in a `role="status"` element: the loader is decoration, the words are the message.

## Variants

| Class or property | What it does |
|---|---|
| `.spin-ring` | SVG ring, 1.4s turn. The arc circle needs `pathLength="100"` |
| `.spin-dots` | Three children that rise one after another, 1.2s cycle |
| `.spin-bar` | A 40% segment that crosses the track, 1.6s. Stretch it across the top of a panel |
| `--spin-size` | Size of the ring and the dots. Default `24px` |
| `.spin-late` | Waits 400ms before it fades in, so an answer that comes back fast never flashes a loader |
| `.spin-pause` inside `.spin-group` | A checkbox that pauses every loader in the group |

## Do

- Use `.spin-late` on anything that usually answers within half a second.
- Switch to a real progress bar the moment you know the fraction (an upload, a file count).
- Offer the pause toggle when a loader can run for more than 5 seconds ([WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)).

## Do not

- Put a spinner over content that is already there. Dim the old content or use a [skeleton](../skeleton/) for content that is coming.
- Run more than one loader for the same wait.

## Reduced motion

Each loader holds a still frame (a quarter arc, three level dots, a segment in the middle of the bar), the pause toggle hides, and the words beside them carry the state.
