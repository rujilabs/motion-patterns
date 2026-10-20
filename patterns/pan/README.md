# Pan

The camera turns on its tripod, so a wide scene slides sideways through a fixed frame. The whole scene moves as one flat sheet: near and far things travel at the same speed. That is the difference from a [tracking shot](../tracking-shot/), where the camera itself travels.

[Live demo](https://motion.rujilabs.com/patterns/pan/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="pan/style.css">

<div class="pan-group">
  <div class="pan">
    <div class="pan-scene"><!-- a wide drawing or image, 3 frames wide --></div>
  </div>
  <label class="pan-pause"><input type="checkbox"> Pause</label>
</div>
```

Give `.pan` a size (an `aspect-ratio` works). The scene fills its height and is `--pan-span` frames wide.

## Options

| Class or property | What it does |
|---|---|
| `--pan-span` | How many frames wide the scene is. Default `3` |
| `--pan-dur` | Time for one sweep, holds included. Default `10s` |
| `.pan-reverse` | Starts on the right and pans left |
| `.pan-pause` inside `.pan-group` | A checkbox that pauses the move |

The move runs for more than 5 seconds, so keep the pause toggle ([WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)).

## Do

- End the sweep on the thing that matters: a sign, a person, a light. The pan is a sentence and the end frame is its last word.
- Keep the speed slow. A frame width every three seconds or more reads as calm; faster reads as a whip pan.

## Do not

- Pan across text the reader has to read while it moves.
- Use a pan where a still wide image would do. Pan only when the order of discovery matters.

## Reduced motion

The scene does not move. The frame rests on the end of the sweep (the start, with `.pan-reverse`) and the pause toggle hides.
