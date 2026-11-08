# Holo card

Use when: a membership or event card on screen should show it is the real one, with holographic foil that changes colour as the card moves.

A card with foil parts: a security strip, a round seal, the wordmark and faint printed rings. Each foil part carries a soft pastel spectrum, a fine grating and a silver band that runs the opposite way. The tilt moves the spectrum one way and the band the other, so the colours slide like a real hologram as the card turns, without flashing. The card tilts toward the pointer or a finger on a spring, and a broad glare follows. Left alone it sways slowly on its own, on two out-of-step loops so it never repeats in a short time; as soon as someone holds it, the sway fades out and gives way to their hand.

[Live demo](https://motion.rujilabs.com/patterns/holo-card/) · [style.css](style.css) · [holo-card.js](holo-card.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="holo-card/style.css">
<script src="play.js"></script>
<script src="holo-card/holo-card.js" defer></script>

<div class="holo-stage">
  <div class="holo card" id="pass" tabindex="0" role="group" aria-roledescription="membership card"
    aria-label="Besi 7 annual member card. Nurul Aina Rahman, member B7-04817.">
    <div class="holo-foil strip" aria-hidden="true"></div>
    <p class="brand"><span class="holo-foil">BESI 7</span></p>
    <p class="name">Nurul Aina Rahman</p>
  </div>
</div>
<button type="button" aria-pressed="false" data-holo-pause="pass">Pause sway</button>
```

`play.js` marks `<html class="js">`; the sway only runs with it, so without the script the card holds one still angle. For foil text, add `background-clip: text; color: transparent` to the `.holo-foil` span.

## Options

| Name | What it does | Default |
|---|---|---|
| `.holo-foil` | Marks a part as foil: spectrum, grating and silver band, all moved by the tilt | |
| `--px`, `--py` | The held tilt, -1 to 1, set by the script | `0` |
| `--sx`, `--sy` | The sway, animated; also the still angle without the script | `.3`, `-.2` |
| `16deg`, `-12deg` in `transform` | The most the card turns each way | |
| `7.4s`, `5.3s` | The two sway loops. Keep them out of step | |
| `data-holo-pause` | On a button: the id of the card it pauses | |

Arrow keys tilt the card a quarter step at a time while it has focus; Escape or Home lays it level. A finger drag sideways tilts it, and the card keeps `touch-action: pan-y` so a swipe up or down still scrolls. The sway stops while the card is off screen.

## Do

- Keep foil to a few parts. A card that is foil all over reads as a toy.
- Keep the spectrum pale. The calm comes from soft colours, not from slowing it down.

## Do not

- Do not put text a person must read on the foil. The colours behind it keep changing.
- Do not make the sway faster or wider: a card that swings on its own pulls the eye from everything else on the page.

## Reduced motion

No sway and no tilt. The card holds one slight angle, so the foil still shows two or three colours, and the Pause button is hidden.
