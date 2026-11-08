# Cube grid tilt

Use when: shoppers pick one sample from a wall of physical samples (tiles, laminates, fabric swatches) and want its price without leaving the grid.

Each sample is a small CSS 3D cube. The cubes all turn to face the pointer as if it were a lamp held 320 px in front of the grid: the ones under it face it almost square on, the far ones turn further, so you see their sides like real blocks on a shelf. Tab to a cube and the lamp moves in front of it. Choosing a cube (click, tap, Enter or Space) rolls it a quarter turn toward you to show the price on its top face; the cube chosen before rolls back.

[Live demo](https://motion.rujilabs.com/patterns/cube-grid-tilt/) · [style.css](style.css) · [cube-grid-tilt.js](cube-grid-tilt.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="cube-grid-tilt/style.css">
<script src="cube-grid-tilt/cube-grid-tilt.js" defer></script>

<ul class="cg-grid" data-cg-lamp="320" data-cg-max="22" aria-label="Tile samples">
  <li><button class="cg-cube" type="button" aria-pressed="false"><span class="cg-body">
    <span class="cg-f cg-front"><span>Terrazzo Kelabu</span></span>
    <span class="cg-f cg-top"><b>RM 7.85</b> a piece, RM 21.81 per m²</span>
    <span class="cg-f cg-right" aria-hidden="true"></span>
    <span class="cg-f cg-left" aria-hidden="true"></span>
    <span class="cg-f cg-bottom" aria-hidden="true"></span>
  </span></button></li>
</ul>
```

The cube is a real button, so its name is the front and top face text together: screen readers hear the price whether or not it is turned over. Style the faces yourself (the demo draws each tile in CSS gradients and shades the sides). Listen for `cg-choose` on the grid; `event.detail.cube` is the chosen button, or `null` when it was put back.

## Options

| Name | What it does | Default |
|---|---|---|
| `--cg-size` | Edge of a cube | `84px` |
| `--cg-depth` | Perspective each cube is seen with. Smaller is more dramatic | `520px` |
| `data-cg-lamp` | How far in front of the grid the pointer's lamp sits, in px. Smaller turns the cubes harder | `320` |
| `data-cg-max` | Largest turn, in degrees. Past about 25 the cubes hide their neighbours | `22` |
| `data-cg-area` | On an ancestor: the pointer anywhere over it moves the lamp, not only over the grid | the grid |

The roll is a transition on the registered `--cg-flip` angle, with the spring curve, so it overshoots a little and settles, and it adds to the tilt instead of fighting it.

## Do

- Keep the faces simple: a sample on the front, two or three short lines on the top.
- Show the chosen item in text as well (the demo's status line), for anyone who misses the roll.

## Do not

- Use more than about 16 cubes. Every face is an element, and a big grid gets heavy on phones.
- Put long text on the top face. At 84 px it fits a price and two short lines.

## Reduced motion

The cubes stay flat to the screen and a chosen cube swaps to its price face at once, with no roll.
