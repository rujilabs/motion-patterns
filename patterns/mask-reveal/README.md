# Mask reveal

Content comes into view from behind an edge. Text lines rise up through their own slot one after another; a picture is uncovered by an edge that travels across it.

[Live demo](https://motion.rujilabs.com/patterns/mask-reveal/) · [style.css](style.css)

## Use

Each line is its own `.mask-line` with one inner element. It needs a trigger: `data-play` on an ancestor plus [`play.js`](../../play.js).

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="mask-reveal/style.css">
<script src="play.js"></script>

<article data-play>
  <figure class="mask-wipe"><img class="mask-zoom" src="ferry.jpg" alt="..."></figure>
  <h1 class="mask-lines">
    <span class="mask-line"><span>The last ferry leaves</span></span>
    <span class="mask-line"><span>at nine, and nobody</span></span>
  </h1>
</article>
```

## Variants

| Class or property | What it does |
|---|---|
| `.mask-line` | The line clips; its inner element rises 110% of its height into place |
| `.mask-lines` (parent) | Lines follow one another 1.5 `--stagger` apart, capped at six steps |
| `.mask-wipe` | The block is uncovered left to right by a `clip-path` edge |
| `.mask-wipe-up` (with `.mask-wipe`) | The edge travels bottom to top instead |
| `.mask-zoom` (inside the wipe) | The picture settles from 108% while it is uncovered |
| `--mask-delay` | Wait before it starts; inherited, so set it once on a parent |

## Do

- Break the lines yourself, at phrase boundaries, and keep them short. Each line is a block, so the break must work at every width you support.
- Let the picture open first and the words follow: the eye goes to the moving edge, then reads.

## Do not

- Use it on body text. A paragraph that arrives line by line makes the reader wait for each line.
- Wipe the main image of the page on load. The largest image should simply be there.

## Reduced motion

Lines and pictures show in place at once, with no clip.

## Without JavaScript

The hidden start states only apply under `.js`, which `play.js` sets. Without it, everything shows.
