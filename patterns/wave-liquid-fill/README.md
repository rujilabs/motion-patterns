# Wave liquid fill

Use when: a fundraiser, savings goal or quota shows how full it is, and the number should feel like something filling up.

Water fills a jar to the share raised. When the jar scrolls into view the level rises from empty, and every later change of level, a RM 50 gift or a RM 3,000 match, kicks the surface. The surface is the sum of three travelling waves that follow deep-water dispersion, so the long wave runs faster than the short ones, plus the jar's own first sloshing mode: the whole surface tilts from wall to wall, and the tilt swings slower when the jar is nearly empty, because shallow water sloshes slower. A bigger change kicks harder. Both die away until the surface is flat, and then nothing moves. A new gift in the middle of a slosh carries the motion on from where it is, so nothing jumps.

[Live demo](https://motion.rujilabs.com/patterns/wave-liquid-fill/) · [style.css](style.css) · [wave-liquid-fill.js](wave-liquid-fill.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="wave-liquid-fill/style.css">
<script src="wave-liquid-fill/wave-liquid-fill.js" defer></script>

<figure class="liquid-fill" data-value="70.35" data-full="76" role="img" aria-label="Jar filled to 70% of the goal.">
  <svg viewBox="0 0 250 262" aria-hidden="true">
    <defs>
      <clipPath id="jar-inside"><path class="lf-inside" d="M66 42H154V49C154 58 ..."/></clipPath>
    </defs>
    <g class="lf-liquid" clip-path="url(#jar-inside)"></g>
    <path d="..."/>   <!-- your glass, drawn after the liquid so it sits on top -->
  </svg>
  <span class="lf-pct">70%</span>
</figure>
```

Draw any vessel: a jar, a tank, a glass, a test tube. `.lf-inside` is its inside, and the water is clipped to it. 0% is the bottom of that shape and 100% is `data-full`. To fill again, change the value:

```js
jar.dataset.value = 81.67;      // or jar.liquid.set(81.67)
jar.liquid.splash();            // a knock with no change of level
```

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-value` | Percentage, 0 to 100 | `0` |
| `data-full` | The y (in the SVG's units) that 100% reaches, like a goal line below the neck | Top of `.lf-inside` |
| `data-decimals` | Decimals in the `.lf-pct` text | `0` |
| `data-label` | Id of a `.lf-pct`-style element outside the figure that counts with the level | None |
| `--lf-water`, `--lf-top`, `--lf-edge` | The water, its surface seen from above, the light on its front edge | Blues |

The first fill takes up to 2.4 s. A change takes 0.7 s plus 2.4 s per whole jar, and the surface is flat again 7 s after the last change. All three times run on Web Animations on the `svg`, which the drawing reads each frame.

## Do

- Put the real number next to the jar in text. The jar shows how full; the text says how much.
- Draw the glass, marks and shine over `.lf-liquid`, as in the demo, so the water sits inside the glass.

## Do not

- Keep the surface moving when nothing has changed. A still surface is the resting state, and the motion should mean "this just changed".
- Use it for a value that changes many times a second. Each change starts a new slosh.

## Reduced motion

The water stands at its level with a flat surface. A change moves the level straight to the new value, with no rise and no slosh.
