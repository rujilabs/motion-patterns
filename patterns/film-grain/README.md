# Film grain

The fine, random speckle of film, new on every frame. The grain sits in overlay blend mode, so it shows most in the mid tones and least in pure black and white, like real grain. In the demo it fades in and keeps moving; the switch freezes it.

[Live demo](https://motion.rujilabs.com/patterns/film-grain/) · [style.css](style.css)

## Use

The noise texture is an SVG turbulence filter written into `style.css`, so there is nothing else to copy.

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="film-grain/style.css">

<section class="look-grain-group">
  <figure class="look-grain">
    <img src="harbour.jpg" alt="Boats in a harbour at dawn">
  </figure>
  <label class="look-grain-pause"><input type="checkbox"> Pause</label>
</section>
```

## Options

| Class or property | What it does |
|---|---|
| `--grain-strength` | How strong the grain is. Default `.5` |
| `--grain-size` | Tile size of the texture; larger is coarser. Default `180px` |
| `--grain-fps-time` | Time for 8 jumps. Default `.68s`, about 12 a second |
| `.look-grain-pause` inside `.look-grain-group` | A checkbox that freezes the grain |

## Do

- Keep it faint. Grain you notice first is too strong.
- Pair it with a still grade (high-key, black and white) for a film look.

## Do not

- Put it over body text or small UI; it makes edges fizz.
- Speed it up past 12 jumps a second; it starts to flicker rather than live.

## Reduced motion

The grain stays, still, and the pause toggle hides.
