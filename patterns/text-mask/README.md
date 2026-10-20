# Text mask

Big letters act as a window onto something moving behind them: a scene, a texture or a gradient. The fill is the element's own background, clipped to the letter shapes, and the animation slides it.

[Live demo](https://motion.rujilabs.com/patterns/text-mask/) · [style.css](style.css) · [sea.svg](sea.svg)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="text-mask/style.css">

<section class="mask-group">
  <label class="mask-pause"><input type="checkbox"> Pause</label>
  <h1 class="text-mask island">ISLAND</h1>
</section>
```

```css
.island {
  font-weight: 900;
  font-size: 120px;
  --mask-fill: url("sea.svg") repeat-x 0 0;
  --mask-size: 240px 100%;  /* one tile */
  --mask-to: 240px 0;       /* one tile per cycle: no seam */
  --mask-ink: #3d7bf2;      /* the colour where background-clip: text is missing */
}
```

## Options

| Class or property | What it does |
|---|---|
| `.text-mask` | Clips the background to the letters and slides it, linear, forever |
| `--mask-fill` | The `background`: an image tile, gradients, or both |
| `--mask-size` | Its `background-size` |
| `--mask-to` | Where the background ends each cycle, from `0 0`. One tile width makes the loop seamless; a second value moves it up or down too |
| `--mask-dur` | One cycle, default `6s` |
| `--mask-ink` | Plain letter colour for browsers without `background-clip: text`, default the text colour |
| `.text-mask-sweep` | With a gradient fill: the fill is twice as wide as the text and sweeps across and back, eased |
| `.mask-pause` inside `.mask-group` | A checkbox that pauses the fill |

The demo tile, [`sea.svg`](sea.svg), is a sky and four bands of waves whose periods all divide its width, so the edges meet. Its shapes are filled with no stroke, so the tile joins show no seam.

## Do

- Use the heaviest weight you have and a big size. Thin letters show too little of the scene to read as a window.
- Keep the scene simple and high contrast, with the darkest part at the bottom of the letters, where the eye lands.
- Put the same word in the page title or heading text: the letters stay real text, so search and screen readers get it.

## Do not

- Mask body text or small labels. A moving fill inside small letters makes them shimmer.
- Use a photo with fine detail. It turns to noise inside the strokes.

## Reduced motion

The window stays and the scene behind it stands still, and the pause toggle hides.
