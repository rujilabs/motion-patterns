# Coin flip

Use when: a loyalty or rewards app tells someone how many points they just earned.

The points arrive as a coin with the amount on its face. It is tossed up showing its back, turns over two and a half times in the air, and lands still tilted a little. Then it wobbles down the way a spun coin does on a table: the tilt shrinks while the direction it leans swings round faster and faster, and the rim it rests on keeps its centre at the right height, until it drops flat with a last quick rattle. The coin is a real solid, two faces and a rim of 32 flat segments, all shaded from one fixed light as it turns. The shadow is the coin's disc projected onto the surface along that same light, so it thins to a line when the coin is edge-on, and grows pale and soft as the coin rises.

[Live demo](https://motion.rujilabs.com/patterns/solid-coin-flip/) · [style.css](style.css) · [coin-flip.js](coin-flip.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="solid-coin-flip/style.css">
<script src="play.js"></script>
<script src="solid-coin-flip/coin-flip.js" defer></script>

<div class="coin-tray" role="img" aria-label="A points coin showing plus 47 points">
  <div class="coin-world">
    <div class="coin-shadow"></div>
    <div class="coin">
      <div class="coin-face coin-heads"><b>+47</b> points</div>
      <div class="coin-face coin-tails">Your logo</div>
    </div>
  </div>
</div>
```

The coin tosses when it scrolls into view. To toss it again for a new amount, change the text on the heads face and call `tray.coin.toss()`; a `coinlanded` event fires when it rests, which is the moment to add the points to the balance.

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `--coin` | Diameter | `124px` |
| `--coin-t` | Thickness | `9px` |
| `--coin-metal`, `--coin-rim`, `--coin-ink` | Faces, edge, engraving | Brass |
| `--coin-shadow` | Shadow colour as `r g b` | `30 25 10` |
| `data-edges` | Rim segments; more is rounder and heavier | `32` |
| `tray.coin.toss()` | Tosses again; returns a promise | |
| `coinlanded` event | Fires on the tray when the coin rests | |

## Do

- Put the amount on the coin and update the balance on `coinlanded`, so the number moves when the coin lands.
- Give the tray a clear area above the coin; it rises toward you.

## Do not

- Toss it for every small event. It is the reward moment after a purchase, about two seconds long.
- Put long text on the face. Three or four characters read at a glance.

## Reduced motion

No toss. The coin lies face up with the amount from the start, and `coinlanded` still fires so the balance updates.
