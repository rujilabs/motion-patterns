# Stretch and squeeze

Variable-width type: a headline arrives wide and settles condensed, and words widen on hover or focus without pushing their neighbours.

[Live demo](https://motion.rujilabs.com/patterns/stretch-squeeze/) · [style.css](style.css)

## Use

```html
<link rel="preload" href="fonts/anybody-vf.woff2" as="font" type="font/woff2" crossorigin>

<h1 class="squeeze"><span>Fresh</span><span>from the</span><span>market</span></h1>

<a class="stretch-host" href="/fruit"><span class="stretch" data-text="Fruit">Fruit</span></a>
```

## Variants

| Class | What it does |
|---|---|
| `.squeeze` | Each `span` line settles from 150% to 62% width over 1.3s, lines staggered (up to 4) |
| `.squeeze-weight` | Add to `.squeeze`: also goes from weight 300 to 800 |
| `.stretch` inside `.stretch-host` | The word widens from 62% to 112% on hover or keyboard focus of the host |
| `data-text` on `.stretch` | Repeat the word here. It reserves the wide size so nothing around it moves |

## The font

You need a variable font with a width (`wdth`) axis, declared with a `font-stretch` range in its `@font-face`; without the range the browser ignores `font-stretch`. The demo uses [Anybody](https://github.com/Etcetera-Type-Co/Anybody) (SIL Open Font License, in [`fonts/`](../../fonts/)). Other free options with a width axis: Roboto Flex, Bricolage Grotesque, Mona Sans.

Preload the font. With `font-display: swap` the first frames otherwise play on a fallback font that cannot change width, and the motion is lost.

## Do

- Keep it to headlines and short labels. Width changes reflow text, which is fine for a few words and costly for paragraphs.
- Pair it with `text-transform: uppercase` and a heavy weight; condensed caps carry the effect best.

## Do not

- Use it on body text or anything people are reading while it moves.
- Leave out `data-text` on hover words in a row; without it the neighbours shift on every hover.

## Reduced motion

The headline shows condensed from the start and hover changes the width at once.
