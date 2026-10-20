# Before and after slider

Two pictures stacked in one frame, with a divider you drag to compare them. When the frame first comes into view, the divider nudges right, then left, then back to the middle, so people see it moves.

[Live demo](https://motion.rujilabs.com/patterns/before-after/) · [style.css](style.css) · [compare.js](compare.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="before-after/style.css">
<script src="play.js"></script>
<script src="before-after/compare.js"></script>

<div class="ba" data-play>
  <img class="ba-before" src="before.jpg" alt="Before: ...">
  <img class="ba-after" src="after.jpg" alt="After: ...">
  <span class="ba-divider" aria-hidden="true"><span class="ba-knob"></span></span>
  <input class="ba-range" type="range" min="0" max="100" value="50" aria-label="Compare before and after">
</div>
```

Give `.ba` a size (an `aspect-ratio` and a width). Both pictures must share the same framing.

## Parts and options

| Class or property | What it does |
|---|---|
| `.ba` | The frame. Clips everything inside it |
| `.ba-before`, `.ba-after` | The two pictures. The after one is clipped from the divider to the right edge |
| `.ba-divider`, `.ba-knob` | The line and its handle. Put an arrow icon in the knob if you like |
| `.ba-range` | An invisible native range input over the whole frame: drag, click to jump, arrow keys, Home and End all work, and screen readers hear the value |
| `--ba-pos` | Where the divider is, as a percentage. Set by `compare.js`; animated by the hint |
| `--ba-line`, `--ba-knob-ink`, `--ba-focus` | Divider colour, knob icon colour, focus ring colour |
| `data-play` with `play.js` | Plays the hint when the frame enters the view. Without it, no hint |

The divider is a full-width layer moved with `translate` by the same percentage as the clip, so it always sits on the clip edge without measuring anything.

## Do

- Write both pictures' `alt` text as the change itself ("Before: cracked walls", "After: repainted").
- Keep the frame wide enough to drag: at least 280px.

## Do not

- Compare pictures taken from different angles. The divider then shows a seam, not a change.
- Replay the hint. Once is a hint, twice is a distraction.

## Reduced motion

No hint. The divider starts in the middle and follows the slider directly.

## Browser support

The hint animates a registered custom property (`@property`), which every current browser supports. Where it is missing, the hint is skipped and the slider still works.
