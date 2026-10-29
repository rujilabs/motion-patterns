# Light open sign

Use when: a restaurant, shop or clinic page should say at a glance whether it is open right now, the way the sign in the window does.

A neon sign driven by opening hours and a clock. You draw only the centre line of each tube; the script builds the tube around it: clear glass when it is off, and when it is lit a coloured tube with a hot white core, plus the light it throws on the board behind, a blurred copy of the tube, so it is brightest at the glass and falls off with distance. Moving into opening hours strikes the sign the way neon really starts: the gas flickers a few times, goes dead for a moment while it finds its path, then holds. Each circuit has its own transformer and strikes on its own, so the border comes up first, and one tired letter starts late and stammers. Leaving opening hours cuts it in one frame, because neon has no afterglow. Nothing flickers once it is steady.

[Live demo](https://motion.rujilabs.com/patterns/light-open-sign/) · [style.css](style.css) · [light-open-sign.js](light-open-sign.js)

## Use

```html
<link rel="stylesheet" href="light-open-sign/style.css">
<script src="light-open-sign/light-open-sign.js" defer></script>

<svg class="neon-sign" viewBox="0 0 320 150" data-hours="11:30-15:00 17:30-23:45" data-time="19:40" role="img" aria-label="Neon sign that reads OPEN">
  <g class="neon-circuit" data-flicker="quick"><path d="M150 140 H34 A24 24 0 0 1 10 116 V34 ..."/></g>
  <g class="neon-circuit" data-flicker="stutter"><path d="M66 42.3 A25 33 0 1 0 74 42.3"/></g>
  <g class="neon-circuit" data-flicker="weak"><path d="M224 108 V42 L262 108 V42"/></g>
</svg>
```

```js
sign.neon.setTime("17:30");   // or minutes since midnight: 1050
sign.addEventListener("neon", (e) => console.log(e.detail.open));
```

Pass the shop's own local time to `setTime`, from the server or from the visitor's clock shifted to the shop's time zone. Write the hours as text next to the sign too: the sign is the glance, the text is the answer.

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-hours` | Open spans, `HH:MM-HH:MM`, space separated. A span may run past midnight | none, always closed |
| `data-time` | The clock, `HH:MM` or minutes | `00:00` |
| `data-flicker` on a circuit | `quick` (0.8 s), `stutter` (1.6 s) or `weak` (2 s, starts late) | `stutter` |
| `--neon`, `--neon-core` | Gas colour and core colour, per circuit. Neon is red-orange; blue is argon | `#ff5236` |
| `--neon-glass`, `--neon-tube` | Unlit glass colour, tube width in viewBox units | `7` |
| `el.neon.setTime(t)`, `.isOpen()`, `.strike()` | Move the clock, ask, strike again | |
| `.is-lit` | On the sign while it is lit | |

## Do

- Run the demo on a simulated clock with a visible control, starting at a set time.
- Leave a small gap in each closed shape: real tubes end in two electrodes. The border here ends at the bottom middle.
- Give a weak letter to only one circuit. One stammer is character; three is a broken sign.

## Do not

- Loop the flicker. A sign that never settles reads as broken, and it is a seizure risk.
- Hide the unlit tubes. Glass you can see when it is off is what makes it read as a real sign.
- Fade it out. Neon goes off at once.

## Reduced motion

No flicker. In opening hours the sign is simply on; outside them it is off.

## See also

[`light-pull-cord`](../light-pull-cord/), the other light you switch.
