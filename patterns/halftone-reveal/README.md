# Halftone reveal

Use when: a print shop, riso studio or poster seller wants its hero picture shown as a four colour halftone print, with the dots growing into the full picture under the visitor's pointer.

The picture is read into WebGL once and redrawn over itself as a print: cyan, magenta, yellow and black dots on paper, each ink on its own screen angle, so the dots make the familiar rosettes. Where the pointer rests, the dots swell, merge and thin into continuous tone, and in the middle the full picture shows through, like a loupe on a press sheet. When nobody points, the loupe drifts slowly over the print on its own. The real `<img>` (with its alt text) stays in the page under the canvas.

The demo picture is an SVG drawn for this entry, [sunset.svg](sunset.svg): a kampung house and two coconut palms on a beach at sunset.

[Live demo](https://motion.rujilabs.com/patterns/halftone-reveal/) · [style.css](style.css) · [halftone-reveal.js](halftone-reveal.js)

## Use

```html
<link rel="stylesheet" href="halftone-reveal/style.css">
<script src="halftone-reveal/halftone-reveal.js" defer></script>

<div class="halftone" data-hr-pitch="7" data-hr-radius=".26">
  <img class="hr-photo" src="job-0418.jpg" alt="Poster art: a kampung house at sunset" width="1600" height="840">
  <canvas class="hr-canvas" aria-hidden="true"></canvas>
  <button type="button" class="hr-pause" aria-pressed="false" hidden>Pause</button>
</div>
```

Give the `.halftone` a size (the picture is cropped to it like `object-fit: cover`, centred). The image must be served from the same origin as the page: WebGL cannot read a picture from another site, and then the plain picture simply stays. The script shows the Pause button only when the loupe can move.

## Options

| Name | What it does | Default |
|---|---|---|
| `data-hr-pitch` | Halftone cell size, in CSS px (4 to 20) | `7` |
| `data-hr-radius` | Size of the loupe, as a share of the picture height (0.08 to 0.6) | `.26` |
| `--hr-paper` | The paper the inks print on (6 digit hex) | `#f8f5ec` |

The idle loupe runs on a Web Animations clock ("halftone loupe"), so the gallery timeline and the Pause button (`aria-pressed`) both stop it; the loupe still follows a real pointer while paused. On touch a finger dragged across the picture moves the loupe, and the picture keeps `touch-action: pan-y`, so the page still scrolls.

## Do

- Use pictures with bold shapes and strong colour: halftone eats fine detail, which is the point of the reveal.
- Keep the cell between 6 and 10 px, so the dots read as print from a normal distance.

## Do not

- Do not use it on a product photo the buyer must judge for colour: four process inks multiplied on screen shift the colours.
- Do not put text on the picture where the loupe passes; put labels on solid tags or below it.
- Do not put two on one page: each holds a live WebGL context.

## Reduced motion

One still print is drawn with the loupe resting on the sun, and nothing moves or follows the pointer; the Pause button hides. Without WebGL or script, and if the picture cannot be read, the plain picture shows.

## How it works

- One full-screen triangle; the fragment shader reads the picture as a texture, cropped like `object-fit: cover`.
- For each ink the pixel is turned onto that ink's screen (cyan 15, magenta 75, yellow 0, black 45 degrees) and floored to a cell. The picture is read once at the cell centre and split into CMYK with a light black: `k = 0.9 (1 - max(r, g, b))^2`, then `c = (1 - r - k) / (1 - k)` and so on.
- The dot radius is `pitch x sqrt(ink / pi)`, so a dot covers the same share of its cell as the ink amount. It grows by `1 + 1.6 G`, with `G = exp(-r^2 / R^2)` a Gaussian round the pointer measured at the cell centre, so dots stay round as they grow. A grown dot also thins toward the ink amount, so merged dots print the continuous tone instead of solid ink.
- The four inks multiply on the paper like real ink; in the middle of the loupe the print mixes into the picture itself.
- The picture is drawn once into a 2D canvas at up to twice its size (crisp for an SVG) and uploaded as one texture.
- The drawing buffer is at most 1.5 times the CSS size, 1 times if the first 30 frames average over 20 ms. Drawing stops off screen, in a hidden tab and once settled while paused, the context is released on `pagehide` and rebuilt after `webglcontextlost`.
