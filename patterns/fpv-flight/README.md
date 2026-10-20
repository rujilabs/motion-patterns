# FPV flight

A fast, low flight through a scene, like a first-person drone shot. The ground streams toward the camera, trees or posts beside the route grow from the horizon and sweep past, and the whole view banks into a left turn and then a right one.

[Live demo](https://motion.rujilabs.com/patterns/fpv-flight/) · [style.css](style.css)

## Use

```html
<section class="fpv-group">
  <label class="fpv-pause"><input type="checkbox"> Pause</label>
  <div class="fpv">
    <div class="fpv-world">
      <div class="fpv-ground"></div>
      <span class="fpv-pass left"><img src="tree.svg" alt=""></span>
      <span class="fpv-pass right"><img src="tree.svg" alt=""></span>
    </div>
  </div>
</section>
```

Give `.fpv-ground` a background that repeats every `--fpv-tile` (40px) down the page, such as field rows or a road with a dashed line. Give each `.fpv-pass` its own `--x` and a negative `animation-delay`, so they are spread along the route from the first frame:

```css
.left  { --x: -46; animation-delay: 0s; }
.right { --x: 52;  animation-delay: -1.2s; }
```

## Options

| Property | What it does |
|---|---|
| `--fpv-speed` | Time for one ground tile to pass. Default `.5s`. Lower is faster |
| `--fpv-tile` | Height of one ground tile. Must match the ground background. Default `40px` |
| `--fpv-bank` | Roll at the peak of a turn. Default `10deg` |
| `--fpv-turn` | One left turn and one right turn. Default `8s` |
| `--fpv-pass` | Time for one thing to fly from the horizon past the camera. Default `2.4s` |
| `--fpv-horizon` | Height of the horizon in the world. Default `44%` |
| `--x` on `.fpv-pass` | Distance beside the route. Negative is left |
| `.fpv-pass` inside `.fpv-group` | A checkbox in `.fpv-pause` pauses everything in the group |

A thing beside the route is drawn as `scale(s) translate(--x, eye height)`. Because the offset is scaled with the size, near things also sweep outward, as they do in a real perspective.

## Do

- Use it for a short, energetic opener: a travel page, a race, a product that is about speed.
- Keep the ground pattern simple and high contrast. The eye reads speed from the lines coming toward it.

## Do not

- Run it behind text. Everything in the frame moves.
- Make it loop for long without the pause toggle. Fast forward motion and rolling make some people feel sick.

## Reduced motion

A still frame of level flight, with the things beside the route at a middle distance. The pause toggle hides.
