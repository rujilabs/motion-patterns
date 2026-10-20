# Repeater

One shape copied many times. Each copy is turned, scaled and delayed a little more than the one before it, so a single simple move becomes a pattern: a square that twists into a spiral, a dot that becomes a loader.

[Live demo](https://motion.rujilabs.com/patterns/repeater/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="repeater/style.css">

<section class="repeater-group">
  <div class="repeater" aria-hidden="true">
    <span></span><span></span><span></span><span></span><span></span><span></span>
  </div>
  <label class="repeater-pause"><input type="checkbox"> Pause</label>
</section>
```

Draw the shape on the children yourself (a size and a border, a background, an SVG). The pattern places, numbers and moves them.

## Options

| Class or property | What it does |
|---|---|
| `.repeater` | Stacks its children in one place. Each copy turns and shrinks a step more, and the twist runs through them one `--rep-delay` apart |
| `--rep-turn` | Extra turn per copy, default `15deg` (`30deg` in the ring) |
| `--rep-shrink` | Scale lost per copy, default `.06` |
| `--rep-delay` | Delay per copy, default `90ms` |
| `--rep-dur` | One cycle, default `6s` |
| `.repeater-ring` | With `.repeater`: copies stand around a circle of radius `--rep-r` (default `24px`) and pulse in turn |
| `.repeater-pause` inside `.repeater-group` | A checkbox that pauses every repeater in the group |

Copies are numbered with `:nth-child` up to 16, and without limit in browsers with `sibling-index()`. The base offset is a `transform` and the animation uses the separate `rotate` and `scale` properties, so the two add up.

## Do

- Use a plain shape with a thin line. The pattern comes from the copies; a detailed shape turns to mush.
- Mark one copy in another colour, as the demo does in red: it gives the eye a thread to follow.
- Keep the whole thing `aria-hidden`. It is decoration.

## Do not

- Go past about 16 copies. Each one is an element that animates.
- Use it behind text people are reading. A turning pattern pulls the eye.

## Reduced motion

The pattern stays as a still picture: each copy keeps its turn and scale. The pause toggle hides.
