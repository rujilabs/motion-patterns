# Liquid transition

The next view floods in from the bottom behind a wavy edge. Two waves of different widths drift in opposite directions while they rise, so the edge keeps changing shape like water instead of sliding up as one fixed outline.

[Live demo](https://motion.rujilabs.com/patterns/liquid-transition/) · [style.css](style.css) · [liquid.js](liquid.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="liquid-transition/style.css">
<script src="liquid-transition/liquid.js"></script>

<div class="liquid-stack" id="drinks" data-liquid>
  <section class="is-current">One</section>
  <section>Two</section>
</div>
<button type="button" data-liquid-go="fill" aria-controls="drinks">Next</button>
```

Keep `wave.svg` next to `style.css`. The mask is that file repeated across, twice as tall as the view: the wave on top, solid below.

## Options

| Class, attribute or property | What it does |
|---|---|
| `.liquid-in` on the incoming view | Floods it in over about 1.4 seconds; `liquid.js` adds it and removes it at the end |
| `.liquid-drain` with `.liquid-in` | Pours from the top instead. `data-liquid-go="drain"` on the button |
| `--liquid-w` | Width of one wave. Default `180px`; wider is calmer |

The stack fires a `liquidchange` event with the new index after each swap.

## Do

- Use it where liquid makes sense: drinks, water, paint, a fill level, a theme poured over a page.
- Give the incoming view a solid background, so the wave edge is a clear line.

## Do not

- Use it for quick, frequent steps. It is slow on purpose.
- Put it on views with busy edges. The wave gets lost against them.

## Reduced motion

`liquid.js` swaps the views at once, and the CSS drops the mask animation.
