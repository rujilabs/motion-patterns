# Laser line

Use when: a laser engraving or custom gift shop wants its hero to show the customer's own name being burnt into wood by a laser, sparks, smoke and all, and to engrave again when the visitor types a new name.

A WebGL fragment shader draws a rubberwood board and a laser that engraves the name into it row by row, the way a real raster engraver works: a white hot spot runs back and forth across the name, firing only where the letters are, with a dim red aiming dot between strokes. Behind it the wood chars dark brown with a scorched edge and glows orange while it cools. Sparks fly up off the spot and fall back, and smoke rises from the row being burnt. Then the plaque rests, a fresh board comes in, and it starts again. The name stays real HTML text the whole time: the script draws the engraving from that text's own font and place, then makes the text transparent over it, so it can still be read by a screen reader and selected.

[Live demo](https://motion.rujilabs.com/patterns/laser-line/) · [style.css](style.css) · [laser-line.js](laser-line.js)

## Use

```html
<link rel="stylesheet" href="laser-line/style.css">
<script src="laser-line/laser-line.js" defer></script>

<div class="laserline" data-ll-form="#plaque-form">
  <canvas class="ll-canvas" aria-hidden="true"></canvas>
  <p class="ll-name">Nurul Aina</p>
  <button type="button" class="ll-pause" aria-pressed="false" hidden>Pause</button>
</div>

<form class="ll-form" id="plaque-form" hidden>
  <label for="plaque-name">Name on the plaque</label>
  <input class="ll-input" id="plaque-name" type="text" value="Nurul Aina" maxlength="24">
  <button type="submit">Engrave</button>
</form>
```

Give the `.laserline` a size; the name sits in its middle. The form can live inside the `.laserline` or anywhere else, pointed to with `data-ll-form`. The script shows the form (it works with WebGL off too, then it just changes the text) and the Pause button only when the laser can move. A long name is shrunk to fit 86 % of the board.

## Options

| Name | What it does | Default |
|---|---|---|
| `data-ll-form` | A selector for the form that changes the name | the `.ll-form` inside |
| `--ll-wood` | The light wood (6 digit hex) | `#e3bf8c` |
| `--ll-grain` | The darker grain (6 digit hex) | `#bf8f5b` |
| `--ll-burn` | The charred engraving, also the fallback text colour (6 digit hex) | `#33190b` |

The font, weight and size of `.ll-name` set the engraving. One loop is 9 seconds (0.6 s fresh board, 5.4 s engraving, 2.4 s rest, 0.6 s board swap) on a Web Animations clock ("laser engraving"), so the gallery timeline and the Pause button (`aria-pressed`) both stop it. Submitting a new name starts the loop again from a fresh board.

## Do

- Use the font the shop really engraves with: the engraving is drawn from the HTML text's own font.
- Keep the name to one line and about 24 characters, like a real plaque.

## Do not

- Do not leave the name off the page in HTML: the canvas is decorative and a screen reader never sees it.
- Do not speed the loop up: a real engraver is steady, and a frantic one looks broken.
- Do not put two on one page: each holds a live WebGL context.

## Reduced motion

One still frame of the finished engraving is drawn, with no spot, sparks or smoke, and nothing moves; a new name is engraved at once, and the Pause button hides. Without WebGL or script, the name shows as plain dark text with a pressed-in shadow on a CSS wood gradient.

## How it works

- One full-screen triangle; the fragment shader does the board, the burn, the smoke and the sparks.
- Wood: value noise from a 64 by 64 random texture (LINEAR filtering on smoothstepped coordinates), three octaves of fbm stretched along the board, bending sine streaks `sin(0.42 y + 14 fbm)`, plus a finer noise and a soft vignette.
- The name is drawn once into a 2D canvas the size of the drawing buffer, from the HTML text's computed font and position, and uploaded as the mask. Its glyph box (`measureText` bounds) is the area the laser scans.
- The scan is a boustrophedon: a pixel in row `k` at share `x` of the row is reached at `s = k + x` on even rows and `k + 1 - x` on odd rows. It is burnt once the scan passes it, and its glow cools as `exp(-1.2 (s_now - s))`. Four offset reads of the mask darken a scorch halo round the letters.
- The spot fires only where the mask is lit (JS reads the mask pixels once per name). Sparks are a pool of six in JS, spawned at the spot while it fires, thrown up and pulled down by gravity, and drawn as short Gaussian streaks.
- Smoke is fbm noise moved up the board, kept to the name's box and above the current row. It moves by up to 64 noise units and wraps there, a whole period of every octave, so it never jumps.
- The drawing buffer is at most 1.5 times the CSS size, 1 times if the first 30 frames average over 20 ms. Drawing stops off screen, in a hidden tab and while paused (once the last sparks land), the context is released on `pagehide` and rebuilt after `webglcontextlost`.
