# Dice roll

Use when: a giveaway or lucky draw picks a winner, and people need to see that the pick was fair.

A real die thrown onto a tray. It falls, strikes the felt on a corner, bounces once, lands flat and rolls edge over edge, its centre rising and falling as it tips over each edge and travelling one edge length per quarter turn. It slows, tips onto its leading edge with the last of its speed, rocks back and settles. The number on top is always the number that was rolled, because the throw is worked out backwards from the resting pose. Each face is shaded from one fixed light as it turns, and the shadow on the felt shrinks, darkens and sharpens as the die comes down. The one and the four are red, as on Chinese dice.

[Live demo](https://motion.rujilabs.com/patterns/solid-dice-roll/) · [style.css](style.css) · [dice-roll.js](dice-roll.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="solid-dice-roll/style.css">
<script src="solid-dice-roll/dice-roll.js" defer></script>

<div class="dice-tray" aria-hidden="true">
  <div class="dice-world">
    <div class="dice-floor"><div class="dice-shadow"></div></div>
    <div class="die">
      <span class="die-face die-front pips-1"></span>
      <span class="die-face die-back pips-6"></span>
      <span class="die-face die-top pips-2"></span>
      <span class="die-face die-bottom pips-5"></span>
      <span class="die-face die-right pips-3"></span>
      <span class="die-face die-left pips-4"></span>
    </div>
  </div>
</div>
<button type="button" id="roll">Pick a winner</button>
<p role="status" id="result"></p>
```

```js
roll.onclick = () => tray.dice.roll().then(n => result.textContent = "Rolled a " + n);
```

`roll()` picks a fair number with `crypto.getRandomValues`. Pass a number (`roll(4)`) if the draw is made somewhere else and the die only shows it. Keep the faces in that order: opposite faces add up to 7.

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `--die` | Edge length | `56px` |
| `--die-ivory`, `--die-pip`, `--die-red` | Body, pips, and the red one and four | Ivory, near black, red |
| `--die-round` | Corner rounding | `9px` |
| `--dice-shadow` | Shadow colour as `r g b` | `20 8 4` |
| `tray.dice.roll(n?)` | Throws; resolves with the number | Fair 1 to 6 |
| `diceroll` event | Fires on the tray when the die rests, `detail.value` | |
| `.pips-1` to `.pips-6` | The same pips on any flat tile, as in the finalist list | |

## Do

- Announce the result in text (`role="status"`) once the die rests. The die itself is `aria-hidden`.
- Disable the button while it rolls, so one press is one roll.

## Do not

- Use a die where the stakes need an audit trail. Show the picked number from the server and let the die act it out.
- Throw more than one at once with this script: they would pass through each other.

## Reduced motion

No throw. The die is set down at once with the rolled number on top, and the result is announced.
