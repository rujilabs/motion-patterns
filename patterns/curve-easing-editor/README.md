# Curve easing editor

Use when: a settings screen or design tool lets people tune how something moves, and they need to see the curve, feel it, and copy the CSS value.

A `cubic-bezier()` graph with two real handles. Time runs across and stays between 0 and 1, as CSS requires; progress runs up and may overshoot, with room above and below the unit box. Press anywhere on the graph and the nearer handle comes with you, keeping its offset from your finger, so a 20 px dot is easy to catch on a phone. Under the graph sits a spacing chart, the way an animator plans a move: one tick for where the object is at every twelfth of the duration, updated while you drag. Bunched ticks are slow, spread ticks are fast. When you let go, or stop pressing keys, the preview replays: a dot crosses the track, and a second dot runs the curve on the graph. That runner moves across on a steady clock and up on the very easing you made, two nested `element.animate()` calls, so it traces the line exactly, overshoot included.

[Live demo](https://motion.rujilabs.com/patterns/curve-easing-editor/) · [style.css](style.css) · [easing-editor.js](easing-editor.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="curve-easing-editor/style.css">
<script src="curve-easing-editor/easing-editor.js" defer></script>

<div class="curve-easing-editor" id="ed" data-value="0.22, 1, 0.36, 1" data-duration="420" data-label="Sheet easing">
  <div class="ee-graph"></div>
  <div class="ee-track"></div>
</div>
<code id="out">cubic-bezier(0.22, 1.00, 0.36, 1.00)</code>
```

`easing-editor.js` builds the curve and the handles inside `.ee-graph`, and the dot and spacing ticks inside `.ee-track` (leave the track out if you only want the graph). Lay the two out however you like. Each handle is a `role="slider"`: its value is the progress, and `aria-valuetext` reads both, such as "time 0.22, progress 1.00".

```js
ed.addEventListener("input", () => out.textContent = ed.css);   // while a handle moves
ed.addEventListener("change", () => save(ed.value));            // [x1, y1, x2, y2], when it stops
ed.set([0.34, 1.3, 0.64, 1], true);                             // a preset: the handles glide there, then it replays
ed.dataset.duration = 600; ed.play();                           // replay at another duration
```

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-value` | Starting `x1, y1, x2, y2` | `0.25, 0.1, 0.25, 1` |
| `data-duration` | Preview length in ms, and what the spacing ticks stand for | `600` |
| `data-y-min`, `data-y-max` | Progress range the graph shows. Change the graph's `aspect-ratio` to match | `-0.3`, `1.3` |
| `data-label` | Start of each handle's accessible name | `Easing` |
| `--ee-ink`, `--ee-accent` | Curve and dots; handles and runner | Near black, red |
| `--ee-grid`, `--ee-box`, `--ee-arm` | Grid lines, unit box fill, handle arms | Greys |

Keys on a focused handle: Left and Right change time by 0.01, Up and Down change progress by 0.01, Shift with an arrow moves 0.1. Values round to two decimals, the precision people copy.

## Do

- Show the CSS value in text and give it a copy button. The curve is for feeling it, the text is for using it.
- Replay on release, not on every pixel of a drag. A preview that restarts 60 times a second shows nothing.

## Do not

- Let time leave 0 to 1. Browsers reject a `cubic-bezier()` with x outside it.
- Hide the linear diagonal. It is the reference that makes "fast start" and "slow end" readable.

## Reduced motion

There are no replays and the handles do not grow on hover. The curve and the spacing chart already show the whole motion as a still picture, and they update as you drag or press keys.
