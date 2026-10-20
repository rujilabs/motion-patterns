# Animated gradient

A slow mesh gradient behind a hero or a card. Four soft colour fields drift on long loops of different lengths over a base colour, so the mix keeps changing without an obvious repeat. Only `transform` moves, and the fields are radial gradients, so there is no blur filter to repaint.

[Live demo](https://motion.rujilabs.com/patterns/animated-gradient/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="animated-gradient/style.css">

<section class="mesh-group">
  <div class="mesh hero">
    <span class="mesh-field" aria-hidden="true"></span>
    <span class="mesh-field" aria-hidden="true"></span>
    <span class="mesh-field" aria-hidden="true"></span>
    <span class="mesh-field" aria-hidden="true"></span>
    <h1>Your headline</h1>
  </div>
  <label class="mesh-pause"><input type="checkbox"> Pause</label>
</section>
```

## Options

| Class or property | What it does |
|---|---|
| `.mesh` | The box. Its content sits above the fields |
| `.mesh-field` x 4 | The colour fields, in order top left, top right, bottom left, bottom right |
| `--mesh-base` | The colour under the fields |
| `--mesh-1` to `--mesh-4` | One colour per field |
| `--mesh-dur` | Base loop length, default `22s`. The fields run at 0.85, 1, 1.15 and 1.3 times it |
| `.mesh-pause` inside `.mesh-group` | A checkbox that stops every field |

## Do

- Pick neighbours on the colour wheel plus one warm accent at most. Close colours blend into light; far ones turn muddy where they meet.
- Check the text contrast against the darkest and the lightest mix the fields can reach.

## Do not

- Speed it up. Under about 12 seconds a loop reads as movement to watch, not as light.
- Put it behind long reading text. Keep it to a hero, a card or an empty state.

## Reduced motion

The fields rest at their start places: a still gradient, and the pause toggle hides.
