# Rise

Entry from below. The element fades in while moving up `--rise-y` (18px), with opacity landing at 60% of the run so it is readable early while the movement settles.

[Live demo](https://motion.rujilabs.com/patterns/rise/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="rise/style.css">

<ul class="stagger">
  <li class="rise">One</li>
  <li class="rise">Two</li>
</ul>
```

## Variants

| Class | When it plays | Use for |
|---|---|---|
| `.rise` | On load | Cards, list items, secondary copy above the fold |
| `.rise-in` | When `play.js` adds `.go` to it or an ancestor with `data-play` | The same, further down the page |
| `.rise-soft` | On load, slower, with a 6px blur | One display line or a hero lede |
| `.stagger` (parent) | Spaces children one `--stagger` (80ms) apart, capped at 8 steps | Lists and grids |

Change the distance per element with a class that sets `--rise-y`, for example `.far { --rise-y: 32px; }`.

## Do

- Keep the page heading and the main image still. Rise the things around them.
- Use `.stagger` for groups of 3 to 8. Past 8 the cap keeps the last item from arriving late.

## Do not

- Put `.rise` on long body text: moving paragraphs are hard to start reading.
- Use `.rise-soft` on many elements at once: blur is expensive to paint.

## Reduced motion

All three classes drop their animation, so every element shows in its final place.
