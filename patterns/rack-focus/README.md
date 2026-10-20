# Rack focus

Focus moves from something close to something far away. Two stacked layers swap blur, and the layer coming into focus grows by 2%, the way a real lens changes size a little when it refocuses.

[Live demo](https://motion.rujilabs.com/patterns/rack-focus/) · [style.css](style.css)

## Use

Stack two layers in one frame. The near layer must be transparent where the far one should show through.

```html
<section class="rack-group">
  <label class="rack-pause"><input type="checkbox"> Pause</label>
  <div class="rack" role="img" aria-label="A cup in front, a shop behind it">
    <img class="rack-far" src="street.png" alt="">
    <img class="rack-near" src="cup.png" alt="">
  </div>
</section>
```

Both layers need to be positioned on top of each other (for example `position: absolute; inset: 0`).

## Variants

| Class or property | What it does |
|---|---|
| `.rack` | Loops: holds on the near layer, pulls to the far one, holds, pulls back. 7s a round |
| `.rack.rack-once` | One pull from near to far, held until `play.js` adds `.go` to it or an ancestor |
| `--rack-blur` | Blur on the layer out of focus. Default `4px` |
| `--rack-dur` | Length of one loop. Default `7s` |
| `.rack-pause` inside `.rack-group` | A checkbox that pauses everything in the group |

## Do

- Use it to move attention between two things that belong together: a product and the place it is used, a speaker and the slide.
- Keep the blur small. 3 to 6px reads as a lens; more reads as a loading state.

## Do not

- Blur text the reader needs. Put words outside the frame or on the layer that ends in focus.
- Stack more than two layers: the eye cannot tell which one the story is about.

## Reduced motion

Nothing moves: the far layer is sharp and the near layer is soft, as at the end of the pull, and the pause toggle hides.

## Without JavaScript

`.rack` needs no script. `.rack-once` shows its end state (far in focus) when `play.js` is not loaded.
