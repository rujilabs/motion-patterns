# Tracking shot

The camera travels beside a moving subject. The subject holds its place in the frame while the world streams past behind it, the near things fast and the far things slow. The viewer reads the speed from the background, not from the subject.

[Live demo](https://motion.rujilabs.com/patterns/tracking-shot/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="tracking-shot/style.css">

<div class="tracking-shot-group">
  <div class="tracking-shot">
    <div class="tracking-shot-layer far"><div>…hills…</div><div>…same hills…</div></div>
    <div class="tracking-shot-layer near"><div>…posts…</div><div>…same posts…</div></div>
    <div class="tracking-shot-subject"><!-- the rider, the car, the runner --></div>
  </div>
  <label class="tracking-shot-pause"><input type="checkbox"> Pause</label>
</div>
```

Each layer holds its picture twice. The picture must join itself at the left and right edges (start and end a hill line at the same height). Mark the second copy `aria-hidden="true"` if it carries text.

## Options

| Class or property | What it does |
|---|---|
| `--track-dur` on a layer | Time to slide one picture width. Short for near layers, long for far ones. Default `8s` |
| `.tracking-shot-subject` | A small up and down bob while riding. Tune with `--track-bob` |
| `.tracking-shot-spin` | On an SVG group: turns it on its own centre, for wheels. Tune with `--track-spin` |
| `.tracking-shot-left` | On the frame: the subject travels left instead |
| `.tracking-shot-pause` inside `.tracking-shot-group` | A checkbox that pauses every part |

The move runs for more than 5 seconds, so keep the pause toggle ([WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)).

## Do

- Use at least two layers with very different speeds (here 30s and 4s). One layer reads as a conveyor belt, not as travel.
- Keep the subject almost still. A small bob sells the ride; drifting across the frame breaks the shot.

## Do not

- Put text in a moving layer.
- Leave it running without the pause toggle: it never stops on its own.

## Reduced motion

A still frame. The layers stop, the wheels stop, the subject stays in place and the pause toggle hides.
