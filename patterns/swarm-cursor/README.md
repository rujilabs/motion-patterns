# Swarm cursor

A small swarm of bees for a honey or garden shop hero: it follows the pointer in a loose cloud, and when the pointer leaves it drifts back to circle the jar. Each bee steers toward its own spot on a small loop round the target, keeps a little room from the others and wanders a touch, so the swarm never moves as one block. Bees turn smoothly to face the way they fly. A focused link or button inside the swarm draws the bees to it, so the keyboard gets the effect too. After a finger lifts, the bees wait 1.2 s and go home. On first view they take off from the jar (1.5 s, a Web Animation).

[Live demo](https://motion.rujilabs.com/patterns/swarm-cursor/) · [style.css](style.css) · [swarm-cursor.js](swarm-cursor.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="swarm-cursor/style.css">
<script src="swarm-cursor/swarm-cursor.js" defer></script>

<section class="swarm" data-count="11">
  <canvas class="sw-canvas" aria-hidden="true"></canvas>
  <h1>Stingless bee honey from 38 log hives.</h1>
  <a href="#add">Add the 250 g jar</a>
  <button type="button" data-pause aria-pressed="false">Pause the bees</button>
  <svg data-swarm-home role="img" aria-label="A 250 g jar of kelulut honey">
    ...the jar...
    <g class="swarm-still" aria-hidden="true">...three resting bees...</g>
  </svg>
</section>
```

The canvas sits over the content with `pointer-events: none`, so links still work under the bees. The bees always move, so keep the pause button: the script toggles its `aria-pressed` and label.

## Options

| Name | What it does | Default |
|---|---|---|
| `data-count` | Number of bees, 3 to 30 | `11` |
| `data-swarm-home` | The element the bees circle when the pointer is away | the middle of the swarm |
| `.swarm-still` | Bees drawn in your markup, shown whenever the canvas swarm is not flying | |
| `--sw-size` | Body length of one bee | `13px` |
| `--sw-body`, `--sw-stripe`, `--sw-wing` | Bee colours | Amber, dark brown, pale blue |
| `canvas.swarm.pause()`, `.play()` | Stop and start the bees from your own code | |

A finger dragged over the hero leads the swarm. The hero keeps `touch-action: pan-y`, so the page still scrolls.

## Do

- Keep it to about a dozen bees. A few read as a swarm; forty read as a problem.
- Give the home element a clear shape (a jar, a hive, a flower) so the idle loop has a reason.

## Do not

- Do not use it on a page where people fill in forms or read long text: the bees cross over the content.
- Do not use it for a brand whose customers might fear bees. Swap the drawing for something friendlier.

## Reduced motion

The canvas stays empty and the `.swarm-still` bees rest on the jar. Without the script the same resting bees show.
