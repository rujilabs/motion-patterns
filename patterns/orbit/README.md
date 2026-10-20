# Orbit

The camera circles the subject and keeps looking at it, so the subject turns to show its sides while the room swings behind it. This one is real CSS 3D: the frame is the lens and a rig turns the whole scene around the subject. The default is an arc shot, a swing of 80 degrees and back.

[Live demo](https://motion.rujilabs.com/patterns/orbit/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="orbit/style.css">

<div class="orbit-group">
  <div class="orbit">
    <div class="orbit-rig">
      <!-- 3D content centred on the rig: transform-style: preserve-3d all the way down -->
    </div>
  </div>
  <label class="orbit-pause"><input type="checkbox"> Pause</label>
</div>
```

Put the subject at the centre of `.orbit-rig` and place everything else around it with `translate3d`. The demo's `page.css` has a small six-face box you can reuse.

## Options

| Class or property | What it does |
|---|---|
| `--orbit-from`, `--orbit-to` | The arc, as `rotateY` angles. Default `-40deg` to `40deg` |
| `--orbit-pitch` | How far the camera looks down on the subject. Default `-14deg` |
| `--orbit-lens` | The `perspective` distance. Smaller is a wider, more distorted lens. Default `800px` |
| `--orbit-dur` | Time for one swing (or one full turn). Default `12s`, `20s` for the full turn |
| `.orbit-full` | Goes all the way round at an even speed |
| `.orbit-pause` inside `.orbit-group` | A checkbox that pauses the move |

The move runs for more than 5 seconds, so keep the pause toggle ([WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)).

## Do

- Add a few things around the subject (posts, a floor grid). They swing past fast and give the turn its depth.
- Keep the arc under about 90 degrees for a product: the back of most things is dull.

## Do not

- Put flat text on the rig: it turns edge on and disappears.
- Nest `overflow: hidden` or `filter` inside the rig. Either one flattens the 3D.

## Reduced motion

A still three-quarter view at the start of the arc. The pause toggle hides.
