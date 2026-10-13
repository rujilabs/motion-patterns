# Tokens

Defined in [`tokens.css`](../../tokens.css). Entries use these names; the gate fails on a raw `cubic-bezier()` anywhere else and on an `--ease-*`, `--dur-*`, `--stagger*` or `--rise-*` name that is not defined here.

## Curves

| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(.2, .7, .2, 1)` | Default for entries: rise, fade, stretch |
| `--ease-spring` | A damped spring as CSS `linear()` (damping ratio .45, about 20% overshoot); `cubic-bezier(.3, 1.6, .5, 1)` where `linear()` is unsupported | Overshoot for small elements: pop, stamp, button press |
| `--ease-inout` | `cubic-bezier(.4, 0, .2, 1)` | Moves that start and stop on screen: draw, crossfade |
| `--ease-paper` | `cubic-bezier(.2, .9, .25, 1.15)` | Paper layers landing with a slight overshoot |
| `--ease-in` | `cubic-bezier(.55, 0, 1, .45)` | Accelerating: the fall before an impact (stamp), and exits |

## Durations

| Token | Value | Frames at 30 fps | Use |
|---|---|---|---|
| `--dur-quick` | `200ms` | 6 | Hover, press, toggles |
| `--dur-base` | `600ms` | 18 | Rise, pop, stamp |
| `--dur-slow` | `900ms` | 27 | Fade, large images, paper layers, stretch |
| `--dur-draw` | `1600ms` | 48 | SVG stroke draw-on |

## Rhythm and distance

| Token | Value | Use |
|---|---|---|
| `--stagger` | `80ms` | Delay step between siblings |
| `--stagger-paper` | `500ms` | Delay step between paper layers |
| `--rise-y` | `18px` | Travel for rise and reveal |

## Same feel in other engines

For video or JS animation that should match the web motion. These are close matches, not exact curves:

| Token | GSAP (approximate) | Remotion (approximate) |
|---|---|---|
| `--ease-out` | `CustomEase.create("out", ".2,.7,.2,1")` (close: `power3.out`) | `Easing.bezier(.2, .7, .2, 1)` |
| `--ease-spring` | `back.out(1.7)` | `Easing.bezier(.3, 1.6, .5, 1)` |
| `--ease-inout` | `power2.inOut` | `Easing.bezier(.4, 0, .2, 1)` |

Loop and run lengths belong to each pattern, not to the tokens:

| Pattern | Length | Change it with |
|---|---|---|
| `marquee` | 38s per loop | `--marquee-dur` |
| `drift` | 7s, 11s, 13s (x, y, tilt); `.drift-slow` 11s, 17s, 19s | `.drift-slow` |
| `crossfade` | 4s per frame: 8s, 12s, 16s for 2, 3, 4 frames | `.crossfade-2`, `.crossfade-4` |
| `pulse` | 2s beat, the halo gone by 60% | `--pulse-count` for how many beats |
| `squeeze` | 1.3s per line | |
