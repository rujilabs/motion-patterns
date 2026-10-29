# Tile image assemble

Use when: a large picture at the top of an article loads, and you want its arrival to feel made rather than a blank box popping full.

A picture that puts itself together from tiles once it has loaded. The frame waits empty. Then a grid of tiles appears over it, each showing its own slice of the same image with `background-position`. Every tile starts scattered out from the centre along the line to its place, a little closer to you, tilted and over-lit, and flies in with a small settle. The tiles arrive in a sweep from the top left corner with a little random lag, so it looks loaded, not drawn. When the last one lands, the real image shows under them and the tiles fade off, so no seams are left behind.

[Live demo](https://motion.rujilabs.com/patterns/tile-image-assemble/) · [style.css](style.css) · [tile-image-assemble.js](tile-image-assemble.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="tile-image-assemble/style.css">
<script src="play.js"></script>
<script src="tile-image-assemble/tile-image-assemble.js" defer></script>

<figure class="image-assemble" data-cols="10" data-rows="6">
  <img src="jetty.jpg" width="1200" height="675" alt="Wooden houses on stilts along a jetty at dusk">
</figure>
```

It starts when the image has loaded and the figure is at least a third in view. The `img` stays the real picture, with its `alt` text, the whole time; the tiles are hidden from screen readers. Call `figure.assemble()` to play it again, and listen for `assembled`. The demo picture is an SVG drawn for it (`hero.svg`); any image works.

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-cols`, `data-rows` | How many tiles across and down. Keep tiles roughly square | `8`, `5` |
| `--ia-turn` | One tile's flight, settle included | `760ms` |
| `--ia-sweep` | From the first tile to the last | `1300ms` |
| `--ia-bg` | The empty frame before tiles land | Warm grey |

Give the `img` its `width` and `height` so the frame holds its size while it waits.

## Do

- Use it once per page, on the hero. It is an arrival, not a gallery effect.
- Keep the whole thing under about two and a half seconds. People came to read.

## Do not

- Use it on pictures below the fold that load while nobody is looking. It waits for the figure to be in view for that reason.
- Use more than about 80 tiles. Each one is a copy of the image in the compositor.

## Reduced motion

The picture shows as soon as it loads. No tiles are made.
