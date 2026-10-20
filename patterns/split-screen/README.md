# Split screen

One scene fills the frame, then the frame splits into two or three panels. The first scene narrows into its panel while the others slide in from the right edge, each kept centred in its own panel, with a thin seam between them. Go back to one and they slide out again.

[Live demo](https://motion.rujilabs.com/patterns/split-screen/) · [style.css](style.css)

## Use

No script: radio inputs anywhere in a `.split-group` pick the number of panels.

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="split-screen/style.css">

<section class="split-group">
  <div class="split">
    <figure>Kuala Lumpur</figure>
    <figure>Lisbon</figure>
    <figure>Lima</figure>
  </div>
  <label><input type="radio" name="n" class="split-to-1" checked> One</label>
  <label><input type="radio" name="n" class="split-to-2"> Two</label>
  <label><input type="radio" name="n" class="split-to-3"> Three</label>
</section>
```

Or put `.split-2` or `.split-3` on `.split` from your own script.

## How it works

Every panel is the full frame. Two registered numbers per panel, `--split-l` and `--split-r`, give its window as fractions of the frame. The panel is cut to that window with `clip-path` and shifted so the middle of the scene sits in the middle of the window, so a panel keeps its subject in view at any width. The numbers are a `--dur-slow` (900ms) transition on `--ease-inout`; the third panel starts one `--stagger` later.

## Options

| Class or property | What it does |
|---|---|
| `.split-2`, `.split-3` on `.split` | Two or three panels. No class: one |
| `.split-to-1`, `.split-to-2`, `.split-to-3` | Radio inputs inside a `.split-group` that do the same with no script |
| `.split-rows` on `.split` | Panels stack top to bottom; the new ones slide up from the bottom edge |
| `--split-seam` | Gap between panels. Default `2px`; the frame's background shows through it |

## Do

- Keep the subject of each scene near its centre: a third of the frame is all that shows.
- Use it to compare: the same moment in three places, before and after, two options.

## Do not

- Split narrow frames into three side by side: on a phone use `.split-rows`, or stop at two.
- Put text near the left or right edge of a scene: it is cut off when the panel narrows.

## Reduced motion

The transition is removed, so the panels change at once.

## Browser support

Needs `@property` to animate (all current browsers). Without it the panels still change, at once.
