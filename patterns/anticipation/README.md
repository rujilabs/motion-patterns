# Anticipation

A small wind-up the opposite way before the main move: the plane pulls back and noses up, holds for a beat, then leaves fast the other way. It tells the eye where to look a moment before the move happens.

[Live demo](https://motion.rujilabs.com/patterns/anticipation/) · [style.css](style.css)

## Use

Give the element a destination, then add `.is-going` from your click handler.

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="anticipation/style.css">

<div class="lane">
  <svg class="plane antic">…</svg>
</div>
```

```css
.lane { container-type: inline-size; overflow: clip; }
.plane { --antic-x: calc(100cqi + 8px); --antic-y: -10px; --antic-tilt: -14deg; }
```

```js
button.addEventListener("click", () => plane.classList.add("is-going"));
```

## Options

| Class or property | What it does |
|---|---|
| `.antic` + `.is-going` | Plays the wind-up, the hold and the move, and stays at the destination |
| `.antic-in` | The same, started when `play.js` adds `.go` |
| `--antic-x`, `--antic-y` | The destination as a translate. Default `0` |
| `--antic-pull` | The wind-up as a share of the trip, default `.14` |
| `--antic-tilt` | A turn held during the wind-up and released on the move |
| `--antic-wind`, `--antic-hold`, `--antic-go` | The three beats, default 270ms, 80ms, 600ms |

Listen for `animationend` with `animationName === "antic-go"` to know when it has arrived.

## Do

- Keep the wind-up small and short. It should be felt more than seen.
- Use it where a move starts from a person's action: send, throw, launch, swipe away.

## Do not

- Put a wind-up before every move on a page. Reserve it for the one big departure.
- Wind up a thing that only shifts a few pixels: there is nothing to anticipate.

## Reduced motion

No wind-up and no travel: the element is at its destination as soon as the class is added, and the demo marks the message sent at once.
