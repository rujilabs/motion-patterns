# Whip pan

The camera swings to the next view so fast that the frame smears sideways, then lands. The blur runs only along the move, which is what makes it read as a camera whip and not a soft focus.

[Live demo](https://motion.rujilabs.com/patterns/whip-pan/) · [style.css](style.css)

## Use

The blur is an SVG filter with a horizontal-only `stdDeviation`; put it once anywhere on the page. The track holds three views and then a copy of the first, so the loop has no seam.

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="whip-pan/style.css">

<svg width="0" height="0" aria-hidden="true">
  <filter id="whip-blur" x="-5%" y="0" width="110%" height="100%"><feGaussianBlur stdDeviation="22 0"/></filter>
</svg>

<section class="whip-group">
  <label class="whip-pause"><input type="checkbox"> Pause</label>
  <div class="whip-pan" tabindex="0" role="group" aria-label="Three shop fronts">
    <div class="whip-track">
      <figure aria-label="Bakery">...</figure>
      <figure aria-label="Florist">...</figure>
      <figure aria-label="Bookshop">...</figure>
      <figure aria-hidden="true">...a copy of the first...</figure>
    </div>
  </div>
</section>
```

## Timing

Each view holds for 2.4 seconds, then the track whips one frame width in 600ms on `--ease-inout`. The blur switches on only for the fast middle of the whip, so both ends of the move land sharp. One loop of three views is `--whip-dur` (9s).

## Options

| Class or property | What it does |
|---|---|
| `.whip-pan` | The frame; clips the track |
| `.whip-track` | The views side by side, each one frame wide |
| `.whip-reverse` | Whips the other way |
| `--whip-dur` | One full loop. Default `9s` |
| `stdDeviation="22 0"` on the filter | The length of the smear. The second number stays 0: no vertical blur |
| `.whip-pause` inside `.whip-group` | A checkbox that stops the loop |

Hover and keyboard focus on the frame stop it too.

## Do

- Use it between places or people that sit side by side in the story, like shops on one street or two people at a table.
- Keep the holds long. The whip is a jolt; the rest needs to be calm.

## Do not

- Whip vertically with this filter. Swap the numbers to `"0 22"` and change the move to `translate: 0 -100%` instead.
- Leave out the SVG filter. Without it the blur does not draw.

## Reduced motion

The track stays on the first view, with no blur, and the toggle hides.
