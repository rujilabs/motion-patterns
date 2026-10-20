# Handheld

The whole frame sways a little, as if the camera is held by hand. Drift (on `translate`) and roll (on `rotate`) run as two loops of different lengths, 6.7s and 4.3s, so the movement does not visibly repeat.

[Live demo](https://motion.rujilabs.com/patterns/handheld/) · [style.css](style.css)

## Use

The moving layer sits inside a parent that clips it. The layer is scaled to 106% so its edges stay out of view.

```html
<section class="handheld-group">
  <label class="handheld-pause"><input type="checkbox"> Pause</label>
  <div class="handheld-frame">
    <img class="handheld" src="harbour.png" alt="The harbour at evening">
  </div>
</section>
```

Anything that should stay still, such as captions or recording marks, goes inside the frame but outside `.handheld`.

## Variants

| Class or property | What it does |
|---|---|
| `.handheld` | About 3px of drift and half a degree of roll |
| `.handheld-calm` | Half as much, like a camera on a shoulder rig |
| `.handheld-walk` | More sway and twice as fast, as if the operator is walking. Scales to 110% to cover the larger moves |
| `--handheld-amp` | Size of the sway. `1` by default |
| `--handheld-speed` | Speed of the sway. `1` by default |
| `.handheld-pause` inside `.handheld-group` | A checkbox that pauses everything in the group |

## Do

- Use it to make a still scene feel present and documentary: a hero image, a quote over a photo, a product in its place.
- Keep the amount small. The viewer should feel it more than see it.

## Do not

- Put text that has to be read inside the moving layer.
- Use `.handheld-walk` for longer than a few seconds: strong sway makes some people feel sick.

## Reduced motion

The frame holds still at its normal size, like a camera on a tripod, and the pause toggle hides.
