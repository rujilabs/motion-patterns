# Squash and stretch

A body that keeps its volume as it moves: tall and thin while it falls fast, flat and wide on contact, tall again as it leaves the floor. Width times height stays close to 1 in every shape, so it reads as rubber rather than something growing and shrinking.

[Live demo](https://motion.rujilabs.com/patterns/squash-stretch/) · [style.css](style.css)

## Use

The bounce is two elements: the outer one carries the height, the inner one the shape, scaled from its foot.

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="squash-stretch/style.css">

<div class="squash-group">
  <div class="pit" aria-hidden="true">
    <span class="squash-shadow"></span>
    <span class="squash"><span class="ball"></span></span>
  </div>
  <label class="squash-pause"><input type="checkbox"> Pause</label>
  <button class="squash-press">Try again</button>
</div>
```

Place the ball so it rests on the floor; the shadow sits under it. Both are yours to style.

## Parts

| Class or property | What it does |
|---|---|
| `.squash` | The bounce. Height follows a real parabola, slow at the top and fast at the floor |
| `.squash > *` | The shape: stretched .88 x 1.14 falling, flat 1.28 x .78 on the floor, .9 x 1.11 taking off |
| `.squash-shadow` | Shrinks to half and fades as the body rises |
| `.squash-pause` in `.squash-group` | A checkbox that pauses the bounce, its shape and the shadow together |
| `.squash-press` | A button that goes 1.06 x .92 under the finger and springs back |
| `--squash-h` | Bounce height, default 72px |
| `--squash-dur` | One bounce, default 1.2s |

## Do

- Keep the body round through the top of the arc. The stretch only shows where it moves fastest.
- Scale the shape from its foot (`transform-origin: 50% 100%`), so it squashes onto the floor rather than into the air.

## Do not

- Squash text, icons with words, or photos. Their shape is the information.
- Change only one axis. A ball that only gets shorter looks crushed, not springy.

## Reduced motion

The ball rests on the floor, round, with its full shadow. The button does not change shape and the pause toggle hides.
