# Style flight

Use when: an animation or design studio lets a client pick an art style by previewing the same short shot in every look.

A "pick your style" menu. Ten cards preview one paper plane flight (takes off bottom left, loops once, glides off the right) in ten looks: pixel, chalkboard, glow sketch, low-poly, comic, flat vector, minimal line, glossy 3D, brick toy and clay figure. Every card is still until you hover it, focus it with the keyboard or tap it; then only that card plays. Click or press Enter and the look opens full size in a dialog, playing large, with its name, a one line description and a price.

[Live demo](https://motion.rujilabs.com/patterns/style-flight/) · [style.css](style.css) · [style-flight.js](style-flight.js)

## Use

```html
<ul class="sf-grid">
  <li class="sf-item" data-look="pixel">
    <button type="button" class="sf-card" aria-haspopup="dialog" data-desc="Chunky square pixels on a tiny grid." data-days="5">
      <span class="sf-view" aria-hidden="true"><span class="sf-still"></span><canvas class="sf-canvas"></canvas></span>
      <span class="sf-name">Pixel</span>
      <span class="sf-price"><span class="num">RM 1,980</span>, 5 days</span>
    </button>
    <button type="button" class="sf-open" hidden>Open<span class="sf-vh"> Pixel</span></button>
  </li>
  <!-- one li per look -->
</ul>
<dialog class="sf-dialog" aria-labelledby="sf-d-name" aria-describedby="sf-d-desc">
  <div class="sf-d-view"><canvas class="sf-d-canvas" aria-hidden="true"></canvas></div>
  <p class="sf-d-count"></p><h2 id="sf-d-name"></h2><p id="sf-d-desc"></p><p class="sf-d-price"></p>
  <button type="button" class="sf-d-pick">Pick this look</button>
  <button type="button" class="sf-d-close">Close</button>
</dialog>
<script src="style-flight.js" defer></script>
```

The motion lives in one place: `pos(t)` in `style-flight.js` is a pure function of `t` from 0 to 1 (a curve, a vertical loop, a curve, joined with matching direction and speed), and `flight(t)` adds the heading and a gentle bank. Every look calls it, so the flight is identical and only the drawing changes.

## Looks

| `data-look` | How it is drawn |
|---|---|
| `pixel` | An 80 x 60 grid filled cell by cell, a dark outline round the plane, scaled up with smoothing off |
| `chalk` | Doubled rough strokes that boil 8 times a second, hatching, a dotted path and falling dust on a green board |
| `glow` | Neon strokes with added light: a wide blurred pass under a thin bright one, a fading magenta trail |
| `poly` | A jittered triangle sky and ridge; flat facets on the plane, lit by its heading |
| `comic` | Halftone panel, ink outlines, halftone shading, speed lines, puffs and a sound effect |
| `flat` | Plain shapes, no outlines, a dashed path |
| `line` | One thin stroke: the whole path so far, then the plane outline |
| `gloss` | Gradient faces, a specular edge, a soft drop shadow and a mirror floor |
| `brick` | The plane snapped to a grid of studded bricks over a baseplate sky |
| `clay` | Lumpy faces that change shape a little each frame, thumb marks, stepped at 12 frames a second |

Add a look by adding a function to `LOOKS` with the signature `(ctx, width, height, t, state)`; draw the plane with `plane(t, height, length)`.

## Options

| What | Where |
|---|---|
| Loop length | `PERIOD` in `style-flight.js`, default 4000 ms |
| The still frame | `STILL`, default `0.74`: just out of the loop, the loop drawn behind |
| Columns and gap | `--sf-cols` (default 5) and `--sf-gap` on `.sf-grid` |
| No-script still | `--sf-sky`, `--sf-wing`, `--sf-keel` on each `.sf-item` |
| Price and turnaround | the card's `.sf-price`, `data-desc` and `data-days` (working days) |

## Do

- Keep the shot short and the same in every card, so the client compares looks, not motion.
- Give every card a text name and a price. The picture is a preview, the label is the choice.

## Do not

- Autoplay all ten at once. The point is one card at a time, and ten canvases running cost battery.
- Use real studio, toy or console names for a look. Describe the look instead.

## Behaviour

- Only a card that is on screen and being previewed runs; nothing runs in a hidden tab. The drawing buffer is the CSS size times `devicePixelRatio`, capped at 2. Each playing canvas runs on a Web Animations clock named `style flight`.
- On a touch screen the first tap plays a card, a second tap or the `Open` button opens it.
- The dialog is a modal `<dialog>`: Tab and Shift+Tab stay inside it, Esc or a click on the backdrop closes it, and focus returns to the card or button that opened it.
- Without script, each card shows its look's colours and a CSS plane, never an empty box.

## Reduced motion

Every card and the dialog show the still frame and never play. Hover, focus and tap do nothing to the picture, and a tap opens the dialog straight away.
