# Variable font axes

Animate the axes of a variable font: a link that turns heavier and leans on hover, a word that breathes from light to heavy, and the same breath rippling through its letters. Each axis is a registered custom property, so each one eases on its own.

[Live demo](https://motion.rujilabs.com/patterns/font-axis/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="font-axis/style.css">

<a class="axis-hover" href="/menu">Menu</a>

<section class="axis-group">
  <label class="axis-pause"><input type="checkbox"> Pause</label>
  <h1 class="axis-ripple" aria-label="Harbour"><span aria-hidden="true">H</span><span aria-hidden="true">a</span>...</h1>
</section>
```

The element needs a variable font. The demo uses Anybody from this repository's `fonts/` folder.

## Options

| Class or property | What it does |
|---|---|
| `.axis` | Applies the three properties below as `font-variation-settings`, for your own states |
| `--fa-wght` | Weight, default 400 |
| `--fa-wdth` | Width in percent, default 100 |
| `--fa-slnt` | Slant in degrees, default 0. Negative leans right, which is how most fonts define it |
| `.axis-hover` | On hover or focus: weight 800, slant -10, width 90 so the word keeps its length. `.axis-host` on a parent triggers it from the parent |
| `.axis-loop` | The word breathes from weight 200 and width 112 to weight 900, width 86 and slant -10, and back |
| `.axis-ripple` | On a word split into one span per letter: the same breath runs through the letters, `--fa-step` (120ms) apart |
| `--fa-dur` | One breath, default `2.4s` |
| `.axis-pause` inside `.axis-group` | A checkbox that pauses the loops |

An axis the font does not have is skipped. The demo font has weight and width axes and no slant axis, so the demo shows weight and width moving together; with a font that has `slnt`, the same classes also lean the letters.

## Do

- Preload the font file. The first run otherwise plays on a fallback font that has no axes.
- Check the widest state fits: the light, wide end of the loop takes the most room.
- Use the hover on short labels, and keep their box from moving with a fixed `min-width` or centred text.

## Do not

- Animate weight in body text. Lines rewrap as the letters change width.
- Send `font-weight` and `--fa-wght` to the same element. `font-variation-settings` wins and the two will disagree.

## Reduced motion

The loops hold a middle weight and stay still, and the pause toggle hides. Hover still changes the weight, at once instead of easing.
