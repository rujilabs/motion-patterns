# Stop-motion

Choppy `steps()` timing that makes a smooth move jump from pose to pose, like a paper model moved by hand between photographs. The defaults run at 8 poses a second, the rate of a lot of paper and clay work.

[Live demo](https://motion.rujilabs.com/patterns/stop-motion/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="stop-motion/style.css">

<div class="stop-group">
  <div class="scene">  <!-- container-type: inline-size -->
    <p class="stop-boil">Paper City</p>
    <div class="bus stop-cross">…</div>
  </div>
  <label class="stop-pause"><input type="checkbox"> Pause</label>
</div>
```

On your own animation, add `.stop-motion` and set the frame count:

```css
.walker { animation: walk 3s infinite; }
.walker.stop-motion { --sm-frames: 24; }  /* 3s at 8 fps */
```

## Options

| Class or property | What it does |
|---|---|
| `.stop-motion` | Turns your animation's timing into `--sm-frames` steps (default 12). Must come after your shorthand |
| `.stop-cross` | Crosses its container and loops, `--sm-frames` steps (48) over `--sm-dur` (6s) |
| `.stop-boil` | Swaps three poses, 1px apart and half a degree turned, every 125ms: a handmade wobble |
| `.stop-spin` | A wheel turning in 8 poses per turn |
| `.stop-pause` inside `.stop-group` | A checkbox that stops every stop-motion loop in the group |

`steps()` applies to each pair of keyframes, so a keyframe list with many stops gets that many steps between each pair. Keep stop-motion keyframes to a start and an end, or one pose per keyframe with `step-start` like the boil.

## Do

- Pick one frame rate for the whole scene. Two rates side by side look like a fault.
- Boil the things that are still. A shape that never moves is what makes a handmade scene look printed.

## Do not

- Use it on interface feedback such as a button press or a progress bar. Choppy reads as slow there.
- Go below 6 poses a second. People stop seeing a move and start seeing separate pictures.

## Reduced motion

The scene is one still frame: the bus parked at the left, the banner still. The toggles hide.
