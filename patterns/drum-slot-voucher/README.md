# Drum slot voucher

Use when: a promotion hands out a voucher code, and getting it should feel like a pull on a slot machine.

Three reels on real 3D cylinders and a lever. Each reel holds its values on a closed ring, placed with `rotateX(angle) translateZ(radius)`. Pull the lever and every reel kicks back a little, runs up to speed, then the reels brake one after another from the left. Each lands a hair past its row and settles back, the way a real reel hits its stopper. The light is fixed in the room, so the shading is a fixed overlay that darkens by `1 - cos(angle)`, the true fall-off on a lit cylinder.

The spin is worked out in advance as positions and played with `element.animate()`, so it is smooth and shows on the timeline.

[Live demo](https://motion.rujilabs.com/patterns/drum-slot-voucher/) · [style.css](style.css) · [drum-slot-voucher.js](drum-slot-voucher.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="drum-slot-voucher/style.css">
<script src="play.js"></script>
<script src="drum-slot-voucher/drum-slot-voucher.js" defer></script>

<div class="slot" data-results="MILO 20 A7K; TEH 15 Q3R">
  <div aria-hidden="true">
    <div class="reel"><ol class="reel-list"><li class="is-on">KOPI</li><li>TEH</li><li>MILO</li>...</ol></div>
    <div class="reel"><ol class="reel-list"><li class="is-on">10</li><li>15</li><li>20</li>...</ol></div>
    <div class="reel"><ol class="reel-list"><li class="is-on">X4B</li><li>A7K</li><li>Q3R</li>...</ol></div>
  </div>
  <button class="slot-lever" type="button" aria-label="Pull the lever to spin for a voucher">
    <span class="lever-arm"><span class="lever-knob"></span></span>
  </button>
</div>
<p role="status" id="result"></p>
```

```js
slot.addEventListener("spinend", (e) => {
  result.textContent = e.detail.values.join("-"); // "MILO-20-A7K"
});
slot.spin(0.8); // spin from a script, strength 0 to 1
```

Decide the voucher on your server and pass it in `data-results`. The reels only show it.

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-results` | The outcomes in order, one per spin, separated by `;`, each value by a space | Random |
| `li.is-on` | Each reel's starting value, also what shows without the script | The first |
| `--reel-row` | Height of one value. The radius follows from it and the count | `56px` |
| `--reel-face`, `--reel-ink` | Reel paper and print colours | Ivory, near black |
| `--lever-len`, `--lever-knob`, `--lever-rod`, `--lever-hub` | The lever's length and colours | `104px`, red, grey, dark |

Give every reel the same number of values (ten in the demo), so all three drums have the same radius, like one machine.

| Input on the lever | Does |
|---|---|
| Drag the knob down past 70 degrees, let go | Spins. A harder pull spins faster. The lever springs back |
| Click, tap, Enter or Space | A full pull, played, then the spin |

## Do

- Keep the result in a live region next to the reels and hide the reels from screen readers.
- Stop the reels left to right with a clear gap. The wait for the last reel is the whole point.
- Hold the lever off (`aria-disabled`) while the reels run. The script does this.

## Do not

- Pretend there is a chance when there is none. If every pull wins, say so, as the demo does.
- Speed it up past about 3 seconds from pull to code. Shorter loses the brake, longer gets tapped twice.

## Reduced motion

The reels go straight to the result and the lever does not swing. The code shows at once.
