# Light card sheen

Use when: a membership, loyalty or gift card on screen should feel like the plastic one, catching the light as it turns in the hand.

A card that tilts toward the pointer and reflects a strip light hanging in the room. The highlight is not a band slid across on a timer. The script treats the card as a mirror: it reflects the tube in the card's plane, runs a line from the eye to that reflection, and the point where the line meets the card is the middle of the highlight. The band's angle is where the plane through the eye and the reflected tube cuts the card. The default tube is a ceiling batten running away from you, a little to the left, so as the card turns the band slides across and leans one way, then the other, as it does under a real shop light. Two materials take it differently: the laminate shows a broad soft band, the copper foil a narrow bright one. The face goes darker as it turns away from the light, a contact shadow on the table slides the other way, and the tilt rides a spring that settles back to the angle a hand would hold it at.

[Live demo](https://motion.rujilabs.com/patterns/light-card-sheen/) · [style.css](style.css) · [light-card-sheen.js](light-card-sheen.js)

## Use

```html
<link rel="stylesheet" href="light-card-sheen/style.css">
<script src="light-card-sheen/light-card-sheen.js" defer></script>

<div class="sheen-stage">
  <div class="sheen-card" data-rest="7 -3" tabindex="0" role="group" aria-roledescription="membership card"
    aria-label="Gold member card, Amira Tan, number 0418 2207 5531">
    <svg class="sheen-foil" viewBox="0 0 428 270" aria-hidden="true">
      <defs>
        <linearGradient class="sheen-foil-light" id="foil" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#9c5e2c"/><stop offset=".5" stop-color="#fff4e2"/><stop offset="1" stop-color="#9c5e2c"/>
        </linearGradient>
      </defs>
      <text x="404" y="236" text-anchor="end" fill="url(#foil)">GOLD</text>
    </svg>
  </div>
</div>
```

Give the card its size and background. Draw foil in the SVG with `fill="url(#foil)"`; its viewBox must have the card's proportions. Put the base colour at both ends of the gradient and the highlight in the middle: the script moves the gradient line so its middle sits on the reflection.

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-max` | Largest tilt, in degrees | `14` |
| `data-rest` | The tilt it settles back to, `rx ry` in degrees, like a card held in a hand | `0 0` |
| `data-light` | Where the tube is, `x y z` in px from the card's middle, y down, z toward you | `-120 -260 420` |
| `data-tube` | The tube's long axis, `x y z` | `0.35 0 1` |
| `--sheen-gloss` | Laminate strength at the band's middle. Matte card: `.12`, gloss: `.4` | `.3` |
| `perspective` on `.sheen-stage` | Viewing distance; the script reads it as the eye position | `900px` |
| `el.sheen.tilt(rx, ry)` | Tilt it from code | |

Pointer: the side under it presses away from you. Touch: hold and drag. Keys: hold an arrow to tip that edge away, Home to let it settle.

## Do

- Put the light where light is in a room, above and in front. A highlight from below looks wrong at once.
- Keep foil to a few marks: a logo, a word, a hairline. Foil everywhere is a mirror, not a card.
- Keep the card's text readable with the band right across it.

## Do not

- Animate the band on its own. It moves because the card moved, or it reads as a sticker.
- Tilt past 15 degrees. A held card hardly turns more, and the text starts to skew.

## Reduced motion

The card goes straight to the tilt with no spring and no wobble, and the highlight still follows the angle.

## See also

[`light-sweep`](../light-sweep/), a band that passes on its own, for when nothing is tilting.
