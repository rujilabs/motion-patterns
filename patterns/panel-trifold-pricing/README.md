# Trifold pricing

Use when: a pricing section has three plans, with the middle one the plan you want people to pick.

The three plans are printed on a trifold leaflet. It arrives folded, showing its cover, which is the back of the left flap. When it scrolls into view the outer flap opens off the middle plan first, which shows the back of the inner flap, then the inner flap opens too. Each flap turns about its real crease with the middle panel, in perspective, and lands a few degrees past flat before it settles, as card stock does. The light follows the same two angles: a flap darkens as it turns away from you, and a flap standing up over the middle plan shades the strip of it next to the crease. On screens under 600 px the plans stack and the flaps fold about horizontal creases above and below the middle plan.

It is CSS only: two registered angles, `--tri-l` and `--tri-r`, animated by `@keyframes` once `play.js` adds `.go`.

[Live demo](https://motion.rujilabs.com/patterns/panel-trifold-pricing/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="panel-trifold-pricing/style.css">
<script src="play.js"></script>

<div class="trifold" data-play>
  <article class="tri-panel tri-left">
    <div class="tri-face tri-front">Day pass, RM 28 a day</div>
    <div class="tri-face tri-back" aria-hidden="true">The cover</div>
  </article>
  <article class="tri-panel tri-mid">
    <div class="tri-face">Flex desk, RM 390 a month</div>
  </article>
  <article class="tri-panel tri-right">
    <div class="tri-face tri-front">Fixed desk, RM 560 a month</div>
    <div class="tri-face tri-back" aria-hidden="true">Add-ons, seen while the inner flap is folded</div>
  </article>
</div>
```

The panels are equal width (and equal height when stacked), so a folded flap covers the middle plan exactly.

## Options

| Property | Does | Default |
|---|---|---|
| `--tri-dur` | How long each flap takes | `1100ms` |
| `--tri-gap` | Delay before the inner flap starts | `420ms` |
| `--tri-paper`, `--tri-paper-back` | Front and back of the card | Warm white, a shade darker |
| `--tri-crease` | The printed crease lines on the middle panel | Brown at 20 percent |

To play it again, take `.go` off, force a reflow and put it back (the demo folds it shut first with `element.animate()` on the same two angles).

## Do

- Make the cover worth seeing for the second it shows: the name and what the leaflet is.
- Use the back of the inner flap for small print people might want, such as add-ons.
- Keep the plan you recommend in the middle. It is the panel that never moves.

## Do not

- Put anything clickable on a back face. It is only seen in passing.
- Add `filter`, `overflow: hidden` or `opacity` below 1 to the panels: each one flattens the 3D, and the backs then show through mirrored.

## Reduced motion

The leaflet shows open and flat from the start, with no folding at all.

## See also

[`panel-map-fold`](../panel-map-fold/), the same crease logic for a map you open by hand.
