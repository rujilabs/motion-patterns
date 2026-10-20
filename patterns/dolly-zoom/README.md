# Dolly zoom

The camera travels back while the lens zooms in to match, so the subject keeps exactly the same size and the space behind it swells toward them (or the other way round, and it falls away). Film people call it the vertigo effect. Use it once, for a moment of realisation.

[Live demo](https://motion.rujilabs.com/patterns/dolly-zoom/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="dolly-zoom/style.css">

<div class="dolly-zoom-group">
  <div class="dolly-zoom">
    <div class="dolly-zoom-layer far"><!-- the far wall --></div>
    <div class="dolly-zoom-layer mid"><!-- things halfway back --></div>
    <div class="subject"><!-- the person: no class, it holds still --></div>
  </div>
  <label class="dolly-zoom-pause"><input type="checkbox"> Pause</label>
</div>
```

Give each layer a `--depth`. For a camera that ends k times further back, a layer at distance z (the subject at 1) ends at scale `k z / (z - 1 + k)`, so `--depth` is that minus 1. The demo's `page.css` lists worked values for k = 2.2.

## Options

| Class or property | What it does |
|---|---|
| `--depth` on a layer | 0 at the subject, larger further back. The layer ends at `1 + amount x depth` |
| `--dz-amount` | Multiplies every depth. A negative value plays it the other way: the background falls away. Default `1` |
| `--dz-origin` | The vanishing point, as a `transform-origin`. Default `50% 50%` |
| `--dz-dur` | Time for one stretch, holds included. Default `8s` |
| `.dolly-zoom-pause` inside `.dolly-zoom-group` | A checkbox that pauses the move |

The move runs for more than 5 seconds, so keep the pause toggle ([WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)).

## Do

- Draw lines that run through the vanishing point (floor edges, rails). They stay fixed while the frames along them slide, which is what makes the space feel elastic.
- Keep the subject dead centre and still.

## Do not

- Use it as decoration. It reads as unease; one per page at most.
- Let a nearer layer outgrow a further one: keep the depths in order, or the corridor folds.

## Reduced motion

Nothing moves. The scene rests at the stretched end of the shot and the pause toggle hides.
