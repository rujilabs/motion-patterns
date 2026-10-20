# Jump cut

Shots of the same subject in nearly the same framing, cut together with no transition. The small jump between them reads as time passing: the clock moves, the light changes, the pile of paper grows.

[Live demo](https://motion.rujilabs.com/patterns/jump-cut/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="jump-cut/style.css">

<section class="jump-cut-group">
  <label class="jump-cut-pause"><input type="checkbox"> Pause</label>
  <div class="jump-cut jump-cut-punch" tabindex="0" role="group" aria-label="Four shots of the same desk">
    <figure><img src="0900.jpg" alt="..."><figcaption>09:02</figcaption></figure>
    <figure><img src="1147.jpg" alt="..."><figcaption>11:47</figcaption></figure>
    <figure><img src="1520.jpg" alt="..."><figcaption>15:20</figcaption></figure>
    <figure><img src="1805.jpg" alt="..."><figcaption>18:05</figcaption></figure>
  </div>
</section>
```

## Timing

Each frame holds for one slot, `--jc-slot` (1.4s), then the next one replaces it on the same frame of time. The keyframes use `step-end`, so there is never a fade and never a blank frame between two shots. Negative delays start every frame mid-cycle, so the first one shows at once.

## Options

| Class or property | What it does |
|---|---|
| `.jump-cut` | 4 frames, one `--jc-slot` each |
| `.jump-cut-3` | 3 frames |
| `--jc-slot` | How long each frame holds. Default `1.4s` |
| `.jump-cut-punch` | The image in every second frame is pushed in to `--jc-punch` (112%) around `--jc-origin` (50% 40%) |
| `.jump-cut-pause` inside `.jump-cut-group` | A checkbox that stops the cuts |

Hover and keyboard focus on the frames stop it too.

## Do

- Keep the camera still and change only what tells the time. The less the frame moves, the clearer the jump.
- Put the time or the step in a caption on each frame, so the cut has a meaning without sound.

## Do not

- Cut faster than about a second per frame. Below that it reads as a flicker, not as time passing.
- Mix this with a crossfade. A jump cut is meant to be abrupt; a fade turns it into a dissolve.

## Reduced motion

Only the first frame shows, nothing cuts, and the toggle hides.
