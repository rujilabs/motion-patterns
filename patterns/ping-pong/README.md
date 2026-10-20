# Ping-pong loop

A loop that plays forward, then the same way back, forever. `animation-direction: alternate` turns it around at each end, so the last frame of one run is the first frame of the next and there is never a seam to hide.

[Live demo](https://motion.rujilabs.com/patterns/ping-pong/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="ping-pong/style.css">

<div class="pingpong-group">
  <label class="pingpong-pause"><input type="checkbox"> Pause</label>
  <div class="frame">
    <span class="beam pingpong"></span>
  </div>
</div>
```

```css
.beam { --pp-y: 162px; }            /* the frame height minus the line */
.seek { --pp-x: 233.34%; width: 30%; } /* percent of its own width: (100 - 30) / 30 */
```

## Options

| Class or property | What it does |
|---|---|
| `.pingpong` | Moves from where it sits to `--pp-x`, `--pp-y` and back |
| `.pingpong-loop` | Timing only: alternate, infinite, ease-in-out. Set `animation-name` to your own keyframes |
| `--pp-dur` | One way, default `1.6s`. A full cycle is twice that |
| `.pingpong-pause` inside `.pingpong-group` | A checkbox that pauses every ping-pong in the group |

## Do

- Keep the curve symmetric. `--ease-inout` played backwards is still `--ease-inout`, so both turns feel the same.
- Use it for work in progress with no known end: a scanner, a search, a seeker on an unknown bar.

## Do not

- Use an ease-out curve. Backwards it becomes an ease-in, and one end slams while the other drifts.
- Ping-pong a thing that has a direction, like an arrow or a vehicle: it will reverse without turning around.

## Reduced motion

Everything stays at its start and the pause toggle hides. The words beside it say what is happening.
