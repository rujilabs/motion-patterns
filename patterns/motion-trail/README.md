# Motion trail

A moving object leaves fading copies of itself on the path it just left, like a long exposure. The copies spread out where it moves fast and bunch up where it slows, so the trail shows speed as well as direction.

[Live demo](https://motion.rujilabs.com/patterns/motion-trail/) · [style.css](style.css)

## Use

Write the object several times inside `.trail` and give every copy the same animation. The pattern stacks them, delays each one and fades it.

```html
<link rel="stylesheet" href="motion-trail/style.css">

<div class="trail-group">
  <label class="trail-pause"><input type="checkbox"> Pause</label>
  <div class="trail" aria-hidden="true">
    <span class="dot"></span><span class="dot"></span><span class="dot"></span>
    <span class="dot"></span><span class="dot"></span><span class="dot"></span>
  </div>
</div>
```

```css
.dot {
  width: 14px; height: 14px; border-radius: 50%; background: currentColor;
  offset-path: path("M40 110 H87 V58 H201 V46 H262"); offset-rotate: 0deg;
  animation: ride 4s var(--ease-inout) infinite both;
}
@keyframes ride { 0%, 12% { offset-distance: 0%; } 80%, 100% { offset-distance: 100%; } }
```

## Options

| Class or property | What it does |
|---|---|
| `.trail` | Stacks its children in one grid cell. Copy 2 to 6 start one `--trail-gap` apart, at opacity .5, .34, .22, .13 and .07 |
| `--trail-gap` | Delay between copies, default 60ms. Longer spreads the trail |
| `--trail-delay` | Delay before the first copy starts |
| `.trail-pause` in `.trail-group` | A checkbox that pauses every copy |

To make the copies smaller, change their `width` and `height` (as the demo does), not `scale`: the `scale` property is applied before `offset-path`, so a scaled copy is pulled off the path.

## Do

- Hold the object still at both ends of a loop and fade the whole trail out at the end, so the copies gather at the finish instead of jumping back.
- Keep the trail to the one thing moving. It tells the eye "follow this".

## Do not

- Animate `opacity` in the copies' keyframes. It overrides the fade that makes them read as echoes.
- Trail text. Copies of words are unreadable.

## Reduced motion

No movement, so no trail: the copies hide and the object stands still. The pause toggle hides.
