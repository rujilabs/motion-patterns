# Dolly in

The camera travels toward the subject. Things close to the lens grow quickly and slide out past the edges; the far distance hardly changes. That spread of speeds is parallax, and it is the whole difference from a [camera zoom](../camera-zoom/), where everything scales together.

[Live demo](https://motion.rujilabs.com/patterns/dolly-in/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="dolly-in/style.css">

<div class="dolly-in-group">
  <div class="dolly-in">
    <div class="dolly-layer far"><!-- sky, hills --></div>
    <div class="dolly-layer mid"><!-- the subject --></div>
    <div class="dolly-layer near"><!-- things right by the lens --></div>
  </div>
  <label class="dolly-in-pause"><input type="checkbox"> Pause</label>
</div>
```

Set `--depth` on each layer, for example `.far { --depth: .1 } .mid { --depth: .45 } .near { --depth: 1 }`. Layers need transparent backgrounds except the furthest.

## Options

| Class or property | What it does |
|---|---|
| `--depth` on a layer | 0 for the far distance, 1 for the nearest layer |
| `--dolly-push` | How far the camera travels. A layer ends at `1 + push x depth`. Default `1.4` |
| `--dolly-origin` | The point the camera heads for, as a `transform-origin`. Default `50% 50%` |
| `--dolly-dur` | Time for one push, holds included. Default `9s` |
| `.dolly-in-pause` inside `.dolly-in-group` | A checkbox that pauses the move |

The move runs for more than 5 seconds, so keep the pause toggle ([WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)).

## Do

- Put something in the foreground. With nothing close to the lens there is no parallax, and a dolly looks like a zoom.
- Aim `--dolly-origin` at the subject, so it stays put while the world opens around it.

## Do not

- Give the far layer a big `--depth`: the horizon should hardly move.
- Push on text. Scaled type softens and the reader loses their place.

## Reduced motion

Nothing moves. Every layer rests at the end of the push, so the subject is shown close up and the foreground is out of the way.
