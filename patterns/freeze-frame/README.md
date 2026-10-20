# Freeze frame

The action stops dead on its key frame, a flash goes off, the picture loses most of its colour and a label lands on it. After a short hold the action runs on. [`freeze.js`](freeze.js) stops your own CSS animations exactly on the frame; [`style.css`](style.css) is the look of the frozen moment.

[Live demo](https://motion.rujilabs.com/patterns/freeze-frame/) · [style.css](style.css) · [freeze.js](freeze.js)

## Use

```html
<section class="freeze-group">
  <label class="freeze-pause"><input type="checkbox"> Pause</label>
  <div class="freeze" data-freeze data-freeze-at="0.55" data-freeze-hold="1600">
    <div class="freeze-scene">
      <span class="ball"></span>
    </div>
    <div class="freeze-flash"></div>
    <p class="freeze-label">Buzzer beater</p>
  </div>
</section>
<script src="freeze.js"></script>
```

Every animation inside `.freeze-scene` must have the same length and start together (time the parts with keyframe percentages, not `animation-delay`). The script reads the first one as the clock. Position `.freeze-label` yourself.

## Options

| Attribute, class or property | What it does |
|---|---|
| `data-freeze` | Turns the block on |
| `data-freeze-at` | The key frame, as a fraction of the action's length. Default `0.5` |
| `data-freeze-hold` | How long the frame holds, in milliseconds. Default `1600` |
| `.is-frozen` | Set by the script during the hold, for your own styles |
| `--freeze-flash` | Colour of the flash. Default white |
| `.freeze-pause` inside `.freeze-group` | A checkbox that pauses the action, the flash and the label |

## Do

- Freeze on the frame that tells the story: the ball in the air, the hand on the trophy, the moment before the fall.
- Keep the label to a few words. The picture is the point; the label names it.

## Do not

- Freeze more than once a pass. A second stop turns a moment into a slideshow.
- Hold for longer than about 2 seconds in a loop: the viewer starts to think it has broken.

## Reduced motion

The script does not run and every animation in the scene stops. The scene shows its resting pose with the frozen look and the label already in place, so draw that resting pose at the key frame (the demo rests with the ball just short of the rim). The pause toggle hides.

## Without JavaScript

The action loops without stopping and the label stays hidden.
