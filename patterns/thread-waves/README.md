# Thread waves

Use when: a textile, yarn or weaving business wants a hero that feels like cloth on the loom, threads that ripple and give way under the hand.

Fine horizontal threads ripple in a slow travelling wave. Near the pointer they bend away from it, the ones above lifting and the ones below sinking, as a finger parts real warp threads, and ease back when it moves on. When nobody points, a slow unseen hand drifts through them on the same clock.

[Live demo](https://motion.rujilabs.com/patterns/thread-waves/) · [style.css](style.css) · [thread-waves.js](thread-waves.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="thread-waves/style.css">
<script src="thread-waves/thread-waves.js" defer></script>

<section class="tw" data-tw-threads="34" data-tw-reach="90">
  <canvas class="tw-canvas" aria-hidden="true"></canvas>
  <div class="copy">
    <h1>Cotton voile, woven on 64 looms.</h1>
  </div>
  <button type="button" class="tw-pause" aria-pressed="false" hidden>Pause</button>
</section>
```

Give `.copy` `position: relative; z-index: 1` and a solid background, like a swing tag on the cloth. The script shows the Pause button only when the wave can run.

## Options

| Name | What it does | Default |
|---|---|---|
| `data-tw-threads` | Number of threads, top to bottom | `34` |
| `data-tw-reach` | How far from the pointer threads bend, in px | `90` |
| `--tw-thread`, `--tw-thread-alt` | The two thread colours, alternating | Indigo, faded indigo |
| `--tw-accent` | Every 9th thread, like a coloured selvedge line | Red |

The wave runs on a Web Animations clock ("threads wave"), so the gallery timeline and the Pause button (`aria-pressed`) both stop it, and the unseen hand with it; threads still part for the real pointer while paused. Each thread is 40 points joined with curves; a frame is three strokes, one per colour, from arrays made once. Drawing stops off screen or in a hidden tab. On touch the area keeps `touch-action: pan-y`.

## Do

- Keep the threads thin and many. Fewer than about 20 reads as stripes, not cloth.
- Use colours from the fabric itself.

## Do not

- Do not raise the reach much past 120 px: the parting turns into a hole.
- Do not let the threads run behind body text without a panel.

## Reduced motion

One still wave is drawn. The threads do not move or part, and the Pause button hides.
