# Shape morph

One shape becomes another instead of being swapped: a play triangle folds into a pause pair, and a block drifts from circle to rounded square to soft blob.

[Live demo](https://motion.rujilabs.com/patterns/shape-morph/) · [style.css](style.css) · [morph.js](morph.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="shape-morph/style.css">
<script src="shape-morph/morph.js"></script>

<button type="button" data-morph aria-pressed="false" aria-label="Play">
  <span class="morph-icon"></span>
</button>

<span class="morph-shape cover"></span>
```

The icon is `1em` square in `currentColor`: size it with `font-size` on the button.

## Parts

| Class or property | What it does |
|---|---|
| `.morph-icon` | Play when its button is not pressed, pause when it is. Two clip-path polygons of four points each, matched corner to corner |
| `.morph-icon.is-on` | Shows pause without a button, if you manage state yourself |
| `data-morph` + `morph.js` | Makes the button a toggle: each click flips `aria-pressed` |
| `.morph-shape` | Loops circle, rounded square, soft blob, turning as it goes |
| `--morph-dur` | One loop of the shape, default 9s |
| `--morph-state` | `paused` stops the shape where it is. The demo pauses the art whenever the episode is paused |

## Do

- Morph between two states of the same control. The change of shape tells people the button changed meaning, not that a new button appeared.
- When you make your own pair, give both shapes the same number of points and list them in the same order (top left, top right, bottom right, bottom left), or the tween twists.

## Do not

- Morph icons that mean unrelated things. Turning a heart into a bin is a trick, not a state change.
- Leave a looping shape running when nothing else on the page is happening. Tie it to a state, as the demo does with playback.

## Reduced motion

The icon swaps at once and the shape holds still as a circle.
