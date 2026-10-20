# Slow motion

The same action twice: once at normal speed, then slowed down so the detail can be seen. The action is your own CSS animation; [`slowmo.js`](slowmo.js) only changes its playback rate at the start of each pass, so the slow pass is exactly the same movement.

[Live demo](https://motion.rujilabs.com/patterns/slow-motion/) · [style.css](style.css) · [slowmo.js](slowmo.js)

## Use

```html
<section class="slowmo-group">
  <label class="slowmo-pause"><input type="checkbox"> Pause</label>
  <div class="slowmo" data-slowmo="0.25">
    <span class="slowmo-rate">1x</span>
    <div class="slowmo-scene">
      <span class="ball"></span>
    </div>
  </div>
</section>
<script src="slowmo.js"></script>
```

```css
.ball { animation: bounce 1.4s linear infinite; }
@media (prefers-reduced-motion: reduce) { /* style.css already stops it; give .ball a good still pose */ }
```

Every animation inside `.slowmo-scene` must have the same length and start together (use keyframe percentages for timing, not `animation-delay`). The script reads the first one as the clock.

## Options

| Attribute, class or property | What it does |
|---|---|
| `data-slowmo` | Turns the block on and sets the slow rate. Default `0.25` (a quarter) |
| `.slowmo-scene` | Holds the action. Only animations inside it change speed |
| `.slowmo-rate` | The script writes `1x` or `0.25x` into it; it takes the accent colour during the slow pass |
| `data-speed` | Set by the script to `normal` or `slow`, for your own styles |
| `--slowmo-accent` | Colour of the rate badge in the slow pass |
| `.slowmo-pause` inside `.slowmo-group` | A checkbox that pauses everything in the group |

## Do

- Use it for a short action with detail that is lost at full speed: a splash, a catch, a card being dealt.
- Keep the action at 1 to 2 seconds. At a quarter speed that is already 4 to 8 seconds.

## Do not

- Slow down a long action: the slow pass becomes a wait.
- Change the length of one part of the action: parts with other lengths drift out of step after the first pass.

## Reduced motion

The script does not run and every animation in the scene stops, so the scene shows its resting pose as one still frame. Draw that resting pose at the most telling moment (the demo rests just after the drop lands). The badge and the pause toggle hide.
