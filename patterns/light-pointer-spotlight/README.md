# Light pointer spotlight

Use when: a grid of features, plans or products should answer the pointer with light, so the card under it reads first and the ones nearby still catch a little.

A lamp held over the grid. Its pool of light is not a glow painted on top: each card, and the table between the cards, has a lit copy of its own surface, shown through a radial mask that follows the Lambert law for a point light at height h, brightness `h³ / (h² + d²)^1.5`. So the middle is flat and bright, the shoulder rolls off, and the light is gone at three lamp heights. Card edges catch light from further away than the flat face, so a neighbour's near edge lights before its face does. The lamp glides after the pointer on a critically damped spring, comes down when the pointer arrives, and lifts away when it leaves: twice as high, so the pool gets wider and four times dimmer, then goes out.

[Live demo](https://motion.rujilabs.com/patterns/light-pointer-spotlight/) · [style.css](style.css) · [light-pointer-spotlight.js](light-pointer-spotlight.js)

## Use

```html
<link rel="stylesheet" href="light-pointer-spotlight/style.css">
<script src="light-pointer-spotlight/light-pointer-spotlight.js" defer></script>

<div class="spotlight">
  <a class="spotlight-item" href="/queue">Queue by SMS</a>
  <a class="spotlight-item" href="/claims">Panel claims</a>
</div>
```

Give each `.spotlight-item` its own background and border. The lit layer sits between that background and the content, so text never gets washed out.

```js
grid.spotlight.aim(240, 90, true);   // park the lamp at a point, in grid px
grid.spotlight.aim(0, 0, false);     // lift it away
grid.addEventListener("spotmove", (e) => console.log(e.detail.item)); // the item under the lamp, or null
```

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-spot-size` | Reach of the light, as a share of an item's longer side | `1.15` |
| `data-spot-follow` | How fast the lamp catches up, per second. `0` puts it right under the pointer | `22` |
| `--spot-lit` | The surface colour in full light. On a dark surface, a warm grey, not white | Warm white |
| `--spot-edge` | An edge in full light | Copper |
| `--spot-x`, `--spot-y`, `--spot-r`, `--spot-a` | Set by the script: position, reach and brightness | |

Keyboard: Tab to a card and the lamp moves to its middle. Touch: the lamp follows a finger and lifts 0.9 seconds after it leaves the glass.

## Do

- Use a mid-tone surface. Light needs room to brighten: on pure white there is nothing left to light.
- Keep the lit colour a lighter, warmer shade of the surface itself, the way a lamp shows a surface.
- Keep the text contrast right with the lamp away, since touch screens and keyboards may never bring it.

## Do not

- Paint a coloured blob that follows the pointer. A light without falloff reads as a sticker.
- Put the light over the text as an overlay. It belongs on the surface under it.
- Use it for meaning. Nothing on the card may depend on being lit.

## Reduced motion

The lamp sits right under the pointer and switches on and off at once, with no glide, no rise and no fade.

## See also

[`light-sweep`](../light-sweep/), a band of light that passes over on its own.
