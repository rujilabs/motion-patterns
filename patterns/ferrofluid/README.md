# Ferrofluid

Use when: a speaker, hi-fi or audio shop wants its hero to show the bass, with a puddle of ferrofluid that spikes up on every beat of the demo track.

A WebGL fragment shader draws a glossy black ferrofluid puddle on a showroom shelf. On every kick of a 112 BPM demo beat, a crown of spikes jumps up in the hexagonal pattern real ferrofluid makes in a magnetic field, harder on the first beat of each bar, and settles between beats. The beat is simulated in code, so the page is silent: "Play the beat" synthesizes the same pattern with Web Audio only when clicked, in time with the spikes, and a second click stops it.

[Live demo](https://motion.rujilabs.com/patterns/ferrofluid/) · [style.css](style.css) · [ferrofluid.js](ferrofluid.js)

## Use

```html
<link rel="stylesheet" href="ferrofluid/style.css">
<script src="ferrofluid/ferrofluid.js" defer></script>

<section class="ferro" data-fo-bpm="112">
  <canvas class="fo-canvas" aria-hidden="true"></canvas>
  <div class="card">
    <h1>Hear the bass before you buy the speakers.</h1>
    <button type="button" class="fo-play" aria-pressed="false" hidden>Play the beat</button>
  </div>
  <button type="button" class="fo-pause" aria-pressed="false" hidden>Pause</button>
</section>
```

The canvas fills the `.ferro` behind its content. The script shows the Pause button when the puddle can move, and the Play button when Web Audio is there too. Leave `.fo-play` out for a silent page.

## Options

| Name | What it does | Default |
|---|---|---|
| `data-fo-bpm` | Tempo of the simulated beat (60 to 160) | `112` |
| `--fo-base` | The showroom shelf (6 digit hex) | `#0d0f12` |
| `--fo-cool` | The strip light overhead | `#9fd4ff` |
| `--fo-warm` | The warm light on the right | `#ffb547` |
| `--fo-x`, `--fo-y` | Where the puddle sits, in heights right of and up from the middle | `.34`, `-.02` |
| `--fo-zoom` | Its size | `.95` |

The custom properties are read again on every resize, so a media query can move the puddle (the demo puts it above the card on a phone). The beat runs on a Web Animations clock ("ferro beat", 16 bars long), so the gallery timeline and the Pause button (`aria-pressed`) both stop it. Pause also stops the sound; Play starts the clock again if it was paused. Sound stops in a hidden tab and on `pagehide`.

## Do

- Keep the sound behind a button the visitor presses. Never start audio on load.
- Light the puddle from the side: black liquid is only its reflections.

## Do not

- Do not crank the tempo past 140: the spikes stop reading as a beat and start to flicker.
- Do not put two on one page: each holds a live WebGL context.

## Reduced motion

One still frame is drawn, with the spikes part way up, and nothing moves; the Pause and Play buttons hide. Without WebGL or script, the canvas keeps a CSS still: a black puddle under a cool and a warm light.

## How it works

- A heightfield, raymarched from a camera looking down at the puddle: a shallow paraboloid dome plus a cone spike on every point of a hexagonal lattice, each `(1 - d / R)^1.6` tall, scaled by the beat and by distance from the middle (a stronger beat wakes spikes further out). The lattice turns once per loop.
- The nearest lattice point comes from the two offset rectangular grids trick, so the spike field costs a couple of `mod` calls. The ray only marches inside the puddle's cylinder: 32 steps find the first crossing, 5 bisection steps refine it.
- The normal is analytic, from the dome's and the nearest spike's gradients. The black surface shows only reflections (two strip lights, a soft band at eye level, the lit shelf), with Schlick Fresnel.
- The beat envelope is worked out in JS from the clock: a fast rise and a decay on every beat, the first beat of each bar louder, a touch on the off-beat hat. Web Audio schedules a kick, a hat and a bass note 0.12 s ahead against the same clock.
- The drawing buffer is at most 1.5 times the CSS size, 1 times if the first 30 frames average over 20 ms. Drawing stops off screen, in a hidden tab and while paused, the context is released on `pagehide` and rebuilt after `webglcontextlost`.
