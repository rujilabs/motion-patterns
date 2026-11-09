# Ink stir

Use when: a watercolour or painting class wants its hero to feel like water on paper, where moving a finger or the mouse stirs real ink.

A real fluid simulation runs on the GPU. The pointer drags the water, three inks (ultramarine, rose and gamboge by default) curl into each other, mix like paint does (blue through yellow turns green) and slowly fade into the paper. When nobody is stirring, an unseen brush keeps drawing slow loops, so the hero is never blank.

[Live demo](https://motion.rujilabs.com/patterns/ink-stir/) · [style.css](style.css) · [ink-stir.js](ink-stir.js)

## Use

```html
<link rel="stylesheet" href="ink-stir/style.css">
<script src="ink-stir/ink-stir.js" defer></script>

<section class="inkstir">
  <canvas class="ik-canvas" aria-hidden="true"></canvas>
  <div class="card">
    <h1>Loose florals in watercolour, from your very first wash.</h1>
    <a href="/book">Book a seat</a>
  </div>
  <button type="button" class="ik-pause" aria-pressed="false" hidden>Pause</button>
</section>
```

The canvas fills the `.inkstir` behind its content. Keep the text on a solid card: the inks can run under it. The script shows the Pause button only when the simulation can run.

## Options

| Name | What it does | Default |
|---|---|---|
| `--ik-paper` | The paper (6 digit hex) | `#f6f1e7` |
| `--ik-a` | Ink one, as it shows at full strength on the paper | `#2f4fa8` |
| `--ik-b` | Ink two | `#c2305a` |
| `--ik-c` | Ink three | `#e7a52a` |
| `--ik-x`, `--ik-y` | Where the idle brush stirs: 0 to 1 from the left and from the bottom | `.68`, `.5` |
| `--ik-r` | How far the idle brush reaches, in heights | `.3` |

The custom properties are read again on every resize, so a media query can move the idle brush away from the card on a phone (the demo does). The simulation steps on a Web Animations clock ("ink stir"), so the gallery timeline and the Pause button (`aria-pressed`) both stop it.

## Do

- Pick inks that mix well: one blue, one red, one yellow gives greens, purples and oranges for free.
- Move the idle brush (`--ik-x`, `--ik-y`) to where there is no text.

## Do not

- Do not use it on a dark page: the inks absorb light, so they only read on paper.
- Do not put two on one page: each holds a live WebGL context and a dozen framebuffers.

## Reduced motion

The unseen brush stirs 150 steps before anything shows, and that one still painting stays; nothing moves and the Pause button hides. Without WebGL or script, the canvas keeps a CSS still: three soft washes that bleed into each other.

## How it works

- Stable fluids on ping-pong framebuffers. Each step: splats add a Gaussian of velocity and ink where the brush moved; vorticity confinement (from the curl) puts back small swirls the solver smooths away; the divergence is taken; 14 Jacobi steps solve for pressure; the pressure gradient is subtracted so the water does not compress; velocity and ink are carried along the velocity by semi-Lagrangian advection.
- The paper shows the inks subtractively: light through ink is `paper * exp(-sum of each ink's absorption)`, with the absorption worked out so concentration 1 shows exactly the colour you set. Edges where the ink changes fast get darker (pooled edges), and a value noise texture gives the paper grain and a little granulation.
- Textures are half float when the GPU can render to it, else float, else bytes at half the size. The byte path stores velocity with zero at 128/255, an affine code, so hardware linear filtering stays correct; ink loses a whole byte now and then so it never stalls on rounding. Without linear filtering on the float type, the shaders mix four nearest reads by hand.
- The drawing buffer is at most 1.5 times the CSS size, 1 times if the first 30 frames average over 20 ms. Drawing stops off screen, in a hidden tab and while paused, the context is released on `pagehide` and rebuilt after `webglcontextlost`.
