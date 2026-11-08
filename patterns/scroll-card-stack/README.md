# Scroll card stack

Cards that pile up as the page scrolls: each one sticks a little lower than the last, the next slides up over it, and the cards underneath shrink and dim slightly so the pile reads as depth.

[Live demo](https://motion.rujilabs.com/patterns/scroll-card-stack/) · [style.css](style.css) · [scroll-card-stack.js](scroll-card-stack.js)

## Use

```html
<link rel="stylesheet" href="scroll-card-stack/style.css">
<script src="play.js"></script>
<script src="scroll-card-stack/scroll-card-stack.js"></script>

<section class="stack">
  <article class="stack-card">Day pass, RM 35</article>
  <article class="stack-card">Flexi 12, RM 318</article>
  <article class="stack-card">Fixed desk, RM 640</article>
</section>
```

Give the cards an opaque background. Leave room under the stack (padding on `.stack`) so the last card stays a while before the pile scrolls away.

## Options

| Property on `.stack` | What it does |
|---|---|
| `--stack-top` | Where the first card sticks. Default `16px` |
| `--stack-peek` | How much lower each next card sticks, so the earlier ones show a strip. Default `12px` |
| `--stack-gap` | Scroll distance between two cards. Default `40svh` |
| `--stack-step` | How much a card shrinks for each card on top of it. Default `.04`, three cards deep at most |

Up to 6 cards get their index from `style.css`; add an `nth-child` rule for more.

## Do

- Keep it to three to five cards of about the same height, such as plans or steps that build on each other.
- Make each card readable on its own: the reader sees only its top strip once the next one lands.

## Do not

- Put `overflow: hidden` on an ancestor of `.stack`. It breaks `position: sticky`; use `overflow: clip`.
- Stack cards taller than the screen. Their bottom is covered before anyone can read it.

## Reduced motion

Nothing sticks and nothing shrinks: the cards show as a plain list, one after another.
