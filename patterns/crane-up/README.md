# Crane up

The camera rises and tips down as it goes. Something that blocked the view at eye level (a hedge, a wall, a crowd) drops away, and the scene behind it opens up from above. Built in CSS 3D, so the ground really lies flat and the trees really stand on it.

[Live demo](https://motion.rujilabs.com/patterns/crane-up/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="crane-up/style.css">

<div class="crane-up-group">
  <div class="crane-up">
    <div class="crane-up-rig">
      <div class="ground"><!-- laid flat with rotateX(90deg) --></div>
      <!-- things standing on the ground, and something in front at eye level -->
    </div>
  </div>
  <label class="crane-up-pause"><input type="checkbox"> Pause</label>
</div>
```

Lay the ground flat with `transform: translateY(<height>) rotateX(90deg)` and point `--crane-origin` at its centre. Everything inside the rig needs `transform-style: preserve-3d`.

## Options

| Class or property | What it does |
|---|---|
| `--crane-tilt` | How far the camera tips down at the top. Default `-55deg` |
| `--crane-lift` | Extra rise, as a `translateY` on the rig, to frame the end shot. Default `0px` |
| `--crane-origin` | The point the camera keeps looking at, as a `transform-origin`. Default `50% 50%` |
| `--crane-lens` | The `perspective` distance. Default `600px` |
| `--crane-dur` | Time for one rise, holds included. Default `10s` |
| `.crane-up-pause` inside `.crane-up-group` | A checkbox that pauses the move |

The move runs for more than 5 seconds, so keep the pause toggle ([WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)).

## Do

- Hide the scene at eye level. The reveal is the point of a crane; without a blocker it is just a tilt.
- Give the scene a layout that reads from above: paths, a centre, one red thing to find.

## Do not

- Tip past about 70 degrees: with perspective the near edge rushes at the lens.
- Put `overflow: hidden` or `filter` inside the rig. Either one flattens the 3D.

## Reduced motion

Nothing moves. The frame rests on the view from the top of the crane and the pause toggle hides.
