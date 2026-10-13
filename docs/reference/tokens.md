# Tokens

Defined in [`tokens.css`](../../tokens.css). Entries use these names; the gate fails on a raw `cubic-bezier()` anywhere else and on an `--ease-*`, `--dur-*`, `--stagger*` or `--rise-*` name that is not defined here.

## Curves

| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(.2, .7, .2, 1)` | Default for entries: rise, fade, stretch |
| `--ease-spring` | `cubic-bezier(.3, 1.6, .5, 1)` | Overshoot for small elements: pop, stamp |
| `--ease-inout` | `cubic-bezier(.4, 0, .2, 1)` | Moves that start and stop on screen: draw, crossfade |
| `--ease-paper` | `cubic-bezier(.2, .9, .25, 1.15)` | Paper layers landing with a slight overshoot |

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

Loop lengths (`marquee` 38s, `drift` 7s and 11s, `crossfade` 12s, `pulse` 1.6s, `squeeze` 1.3s) are part of each pattern, not tokens.
