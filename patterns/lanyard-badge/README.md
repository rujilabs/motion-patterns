# Lanyard badge

Use when: a pass, ticket or ID on screen should feel like the physical one, something the person can pick up and let swing, while its details stay readable.

A badge hangs from a lanyard whose two strands come in from above the box. Drag the badge and the strap follows your hand at a fixed length; let go and it swings as a real pendulum, `theta'' = -(g/L) sin(theta) - c theta'`, with a 1.4 second swing and damping strong enough that it comes to rest in about four seconds, as a lanyard does. The badge hangs from the strap's end on a clip and lags behind it on its own small spring, so it twists a little each time the strap turns back, and the strap bows away from the way it is moving. The speed you let go with is the speed it swings with. Arrow keys nudge it, Enter or Space gives it a push.

[Live demo](https://motion.rujilabs.com/patterns/lanyard-badge/) · [style.css](style.css) · [lanyard-badge.js](lanyard-badge.js)

## Use

```html
<link rel="stylesheet" href="lanyard-badge/style.css">
<script src="play.js"></script>
<script src="lanyard-badge/lanyard-badge.js" defer></script>

<div class="lanyard">
  <svg class="lanyard-strap" aria-hidden="true"></svg>
  <div class="lanyard-badge" tabindex="0" role="group" aria-roledescription="badge"
    aria-label="Kuching Code Week pass, Farah Lim Mei Ling, speaker">
    ...
  </div>
</div>
```

```js
document.querySelector(".lanyard").lanyard.nudge(1.3);   // a push, in radians a second
```

`play.js` marks `<html class="js">`. Without the script, the badge hangs straight under a still V of strap drawn in CSS.

## Options

| Name | What it does | Default |
|---|---|---|
| `--lanyard-length` | Strap length in px, from a pivot 40 px above the box to the clip | `200px` |
| `--lanyard-h` | Height of the box; leave room for the badge below the strap | `380px` |
| `--lanyard-color` | The strap | Red |
| `K`, `DAMP` in the script | Swing stiffness (sets the 1.4 s swing) and damping | `20`, `2.1` |
| `K2`, `DAMP2` in the script | How the badge twists on its clip | `110`, `8` |
| `MAX` in the script | The furthest a drag can lift it, in radians | `0.85` |

The swing time runs on a Web Animation called "badge swing", so a page or the gallery timeline can pause it. The loop stops as soon as the badge is still.

## Do

- Keep what the badge says in the page as well: a swinging badge is hard to read for a moment.
- Give it room to swing to both sides. Clip the section, not the page, so a wide swing never scrolls sideways.

## Do not

- Do not swing it on a timer. It moves when someone moves it, plus one small swing when it first shows.
- Do not lower the damping to make it swing longer: past five seconds of motion it needs a pause control.

## Reduced motion

No swing. A drag still moves the badge with the hand, and on release it hangs straight at once; the keys do nothing.
