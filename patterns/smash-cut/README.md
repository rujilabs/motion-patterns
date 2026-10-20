# Smash cut

A calm scene cuts hard to a loud, contrasting one with no transition. The contrast does the work: quiet colour against loud colour, slow against fast, small type against big type.

[Live demo](https://motion.rujilabs.com/patterns/smash-cut/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="smash-cut/style.css">

<section class="smash-group">
  <label class="smash-pause"><input type="checkbox"> Pause</label>
  <div class="smash-cut" tabindex="0" role="group" aria-label="A quiet bedroom cuts to a ringing alarm">
    <figure class="smash-calm">...the quiet scene...</figure>
    <figure class="smash-loud">
      <div class="smash-hit">...the thing that is loud...</div>
      <p>07:00</p>
    </figure>
  </div>
</section>
```

## Timing

The cut sits at 64% of `--smash-dur` (7s): 4.5 seconds of calm, then 2.5 seconds of noise. The calm side pushes in by 6% at a constant, slow speed, so the stillness builds. At the cut the loud side is already at full size; `.smash-hit` lands at 112% for one frame, settles on `--ease-out`, then rings with a short rotation shake.

## Parts

| Class or property | What it does |
|---|---|
| `.smash-cut` | Stacks the two scenes in one cell |
| `.smash-calm` | Visible until the cut, with a slow push-in |
| `.smash-loud` | Appears on the cut, on one frame |
| `.smash-hit` | Inside the loud scene: the punch and the ring |
| `--smash-dur` | One full loop. Default `7s` |
| `.smash-pause` inside `.smash-group` | A checkbox that stops the loop |

Hover and keyboard focus on the scene stop it too.

## Do

- Make the calm side genuinely calm: dark or muted colour, small type, very little moving.
- Shake only the one loud object, not the whole frame. A shaking frame reads as an error.

## Do not

- Add a fade or a flash to the cut. The joke, or the shock, lives in the missing transition.
- Use it for routine page changes. Save it for one moment that should feel like a jolt.

## Reduced motion

Only the calm scene shows, still, and the toggle hides.
