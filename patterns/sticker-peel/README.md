# Sticker peel

A promo sticker folds back from its bottom-right corner, shows its paper back, and uncovers the discount code printed under it. It peeks on hover and keyboard focus; a click or tap peels it all the way and keeps it there.

[Live demo](https://motion.rujilabs.com/patterns/sticker-peel/) · [style.css](style.css) · [sticker-peel.js](sticker-peel.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="sticker-peel/style.css">
<script src="sticker-peel/sticker-peel.js" defer></script>

<div class="sp">
  <p class="sp-under" id="code">Your code <strong>KOPITENOM</strong></p>
  <button class="sp-sticker" type="button" aria-expanded="false" aria-controls="code">
    <span class="sp-face"><b>12%</b> off, peel me</span>
    <span class="sp-flap" aria-hidden="true"><span class="sp-back"></span></span>
  </button>
</div>
```

Style `.sp-face` as the sticker and `.sp-under` as what is printed below it. Put the code in the bottom-right corner of `.sp-under`: that is the part the fold uncovers first. The code is real text, so screen readers can always read it.

## Options

| Name | What it does | Default |
|---|---|---|
| `--sp-size` | Side of the square sticker | `128px` |
| `--sp-r` | Corner radius | `14px` |
| `--sp-peek` | Fold on hover and focus, in % of the side | `72` |
| `--sp-open` | Fold after a click, up to `100` (folded in half) | `96` |

The fold is one registered number, `--sp-k`, so it eases with a plain transition. Browsers without `@property` jump to the end instead of easing.

## Do

- Use it for a small reward someone chooses to see: a code, a hidden price, a prize.
- Rotate the whole `.sp` a few degrees: a stuck-on sticker is never straight.

## Do not

- Do not hide information people need to decide, like the real price, under a sticker.
- Do not make it round: the fold is a straight line, and a round sticker would show a square flap.

## Reduced motion

No easing. The sticker is folded back at once on hover, focus or a click, and the code shows.
