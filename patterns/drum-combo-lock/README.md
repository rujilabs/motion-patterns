# Drum combo lock

Use when: a gift, a reward or a hidden message should be opened by turning number dials to the right code.

A padlock with four number dials. Each dial is a real ten-sided cylinder: ten faces 36 degrees apart, placed with `rotateX(angle) translateZ(radius)`, so the ring closes on itself and the digits above and below the window curve away and darken. Every number lands with a small, slightly bouncy spring, the way a detent clicks. When all four dials rest on the code, the shackle lifts, its short leg clears the body, and it swings out on the long leg.

[Live demo](https://motion.rujilabs.com/patterns/drum-combo-lock/) · [style.css](style.css) · [drum-combo-lock.js](drum-combo-lock.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="drum-combo-lock/style.css">
<script src="play.js"></script>
<script src="drum-combo-lock/drum-combo-lock.js" defer></script>

<div class="lock" data-code="1408" id="lock">
  <span class="lock-shackle" aria-hidden="true"></span>
  <div class="lock-body">
    <div class="lock-dials" role="group" aria-label="Lock code, four digits">
      <div class="dial" role="spinbutton" tabindex="0" aria-label="First digit"
           aria-valuemin="0" aria-valuemax="9" data-value="2">2</div>
      <!-- one .dial per digit -->
    </div>
  </div>
</div>
```

```js
lock.addEventListener("unlock", showGift); // every dial is at rest on the code
lock.lock("2965");                         // close it and spin the dials away to 2965
```

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-code` on `.lock` | The digits that open it, one per dial | Required |
| `data-value` on `.dial` | The starting digit. Put the same digit in the text for the no-script page | `0` |
| `--dial-row` | Height of one digit. The cylinder radius follows from it | `46px` |
| `--lock-body`, `--lock-edge` | The body colour and its bottom edge | Brass |
| `--lock-steel`, `--lock-steel-edge` | The shackle | Steel grey |
| `--dial-metal`, `--dial-ink`, `--lock-slot` | The dials, their numbers and the slot behind them | Pale brass, dark brown, near black |

| Input on a dial | Does |
|---|---|
| Drag, flick | Turns with the finger, glides on a flick, clicks into a digit |
| Tap above or below the window | Turns that digit in |
| Arrow Up or Down, mouse wheel | One digit up or down |
| A number key | Turns the short way to that digit |
| Home, End | 0, 9 |
| Arrow Left or Right | The previous or next dial |

## Do

- Put the hint next to the lock. A demo or a gift should open in under a minute.
- Keep what is inside on the page, hidden under `.js`, so it still reads without the script.
- Fire the reveal from `unlock`, which waits for every dial to stop, not from a key press.

## Do not

- Use it to protect anything. The code is in the HTML.
- Hint which digits are right. A real lock gives nothing away, and a half-open state feels broken.

## Reduced motion

Dials land on their digit at once, without the detent bounce. The shackle is simply up or down: no lift, no swing.
