# Parcel open

Use when: an order tracking screen turns to "Delivered", and you want the moment to feel like the box at the door.

A carton in CSS 3D is set down on the doorstep and opens. It drops the last 40 px under gravity and bounces once while its contact shadow tightens; the status turns to Delivered the moment it touches down. A knife line runs along the seam and the tape splits, then the four top flaps swing open about their real crease lines, the two long outer flaps first, then the short inner ones, as you open a real carton. Each flap swings past where it will rest and settles back on its crease. Each has a printed outside and a plain inside, shaded every frame from its real angle to one fixed light, so a flap goes dark as it falls away from the light.

[Live demo](https://motion.rujilabs.com/patterns/solid-parcel-open/) · [style.css](style.css) · [parcel-open.js](parcel-open.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="solid-parcel-open/style.css">
<script src="play.js"></script>
<script src="solid-parcel-open/parcel-open.js" defer></script>

<div class="parcel" role="img" aria-label="Your parcel, opened">
  <div class="parcel-world">
    <div class="parcel-shadow"></div>
    <div class="parcel-box">
      <div class="parcel-in parcel-in-back"></div><div class="parcel-in parcel-in-left"></div>
      <div class="parcel-in parcel-in-right"></div><div class="parcel-in parcel-in-front"></div>
      <div class="parcel-fill">What is inside</div>
      <div class="parcel-wall parcel-back"></div><div class="parcel-wall parcel-left"></div>
      <div class="parcel-wall parcel-right"></div><div class="parcel-wall parcel-front">Label</div>
      <div class="parcel-flap flap-left"><div class="parcel-plate"><div class="flap-side flap-in"></div><div class="flap-side flap-out"></div></div></div>
      <div class="parcel-flap flap-right"><div class="parcel-plate"><div class="flap-side flap-in"></div><div class="flap-side flap-out"></div></div></div>
      <div class="parcel-flap flap-front"><div class="parcel-plate"><div class="flap-side flap-in"></div><div class="flap-side flap-out"></div></div></div>
      <div class="parcel-flap flap-back"><div class="parcel-plate"><div class="flap-side flap-in"></div><div class="flap-side flap-out"></div></div></div>
      <div class="parcel-cut"></div>
    </div>
  </div>
</div>
```

It plays when it scrolls into view. Listen for `parceldelivered` to flip your status text at touchdown, and call `el.parcel.open()` to play it again.

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `--pw`, `--pd`, `--ph` | Width, depth and height of the carton. Flaps are `--pd / 2` deep | `200px`, `150px`, `116px` |
| `--kraft`, `--kraft-in` | Outside and inside of the board | Kraft brown |
| `--tape` | Packing tape | Buff |
| `--parcel-shadow` | Shadow colour as `r g b` | `40 25 10` |
| `parceldelivered`, `parcelopened` events | Touchdown, and the last flap at rest | |

## Do

- Change the status at `parceldelivered`, not before. The box landing is the news.
- Put something in the box: a thank-you card or the product. An empty box opening is a let-down.

## Do not

- Play it for every step of the tracking. It is for the last one.
- Turn the camera low: the inside is drawn to be seen from above.

## Reduced motion

The box is shown open on the doorstep from the start, with no drop and no knife line, and the status reads Delivered.
