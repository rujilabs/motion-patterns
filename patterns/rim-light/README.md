# Rim light

A thin bright edge traces the subject's outline against a dark ground; the rest of the subject sits in shadow. In the demo the light travels behind the bust, from the left edge over the top to the right edge and back.

[Live demo](https://motion.rujilabs.com/patterns/rim-light/) · [style.css](style.css)

## Use

The subject must be a cut-out (an inline SVG or a transparent PNG). The edge is a hard drop-shadow offset toward the light, so it only shows where the outline faces that way.

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="rim-light/style.css">

<div class="look-rim-group">
  <figure class="look-rim look-rim-move">
    <img class="look-subject" src="bust.png" alt="A plaster bust">
  </figure>
  <label class="look-rim-pause"><input type="checkbox"> Pause</label>
</div>
```

## Options

| Class or property | What it does |
|---|---|
| `.look-rim` | The still look: rim on the upper left |
| `.look-rim-move` | The light travels around the outline, left, top, right, and back |
| `--rim-x`, `--rim-y` | Where the rim sits, as an offset toward the light. Default `-2px` `-1px`. Larger is a thicker rim |
| `--rim-color`, `--rim-glow` | The edge itself and the soft bloom around it |
| `--rim-body` | How dark the subject is, as a brightness. Default `.22` |
| `--rim-ground` | The background. Default near black |
| `--rim-dur` | Time for one pass. Default `7s` |
| `.look-rim-pause` inside `.look-rim-group` | A checkbox that pauses the move |

## Do

- Keep the ground darker than the subject's body: the rim only reads against dark.
- Keep the offset at 1 to 3 pixels. A real rim is a hairline.

## Do not

- Put a busy photo behind it; the rim gets lost in detail.
- Remove the pause toggle while `.look-rim-move` runs: the loop lasts longer than 5 seconds ([WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)).

## Reduced motion

The light stops behind and to the left, so the rim stays on the upper left edge; the toggle hides.
