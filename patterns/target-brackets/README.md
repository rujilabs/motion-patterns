# Target brackets

Four corner brackets glide and resize to frame the card under the pointer or with keyboard focus, and land with a small spring, like a camera finding focus.

[Live demo](https://motion.rujilabs.com/patterns/target-brackets/) · [style.css](style.css) · [target-brackets.js](target-brackets.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="target-brackets/style.css">
<script src="target-brackets/target-brackets.js" defer></script>

<div class="tb">
  <ul>
    <li><a class="tb-target" href="#mengkuang-tote">Mengkuang tote, RM 86.40</a></li>
    <!-- more cards -->
  </ul>
  <span class="tb-frame" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
</div>
```

The brackets take `color` from `.tb-frame`. They are the focus ring once the script runs, so pick a colour with at least 3:1 contrast on the page.

## Options

| Name | What it does | Default |
|---|---|---|
| `--tb-pad` | How far the brackets sit outside the card | `6px` |
| `--tb-arm` | Length of each bracket arm | `16px` |
| `--tb-line` | Bracket thickness | `3px` |
| `--dur-base` | Glide time between cards | `600ms` |

The first placement jumps and fades in, so the brackets never fly in from a corner of the page. A tap on touch moves them too.

## Do

- Use it on a small grid of things of about the same size: products, plans, photos.
- Keep the cards still. The brackets are the motion.

## Do not

- Do not use it on a long list that scrolls: the brackets would chase rows off screen.
- Do not add a second hover effect on the card on top of it.

## Reduced motion

The brackets jump straight onto each card with no glide. They still mark the card under the pointer and the focused one.
