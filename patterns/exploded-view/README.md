# Exploded view

An object drawn as flat layers in an isometric view lifts apart along its vertical axis, so you can see what is inside. A label slides out beside each layer as it arrives, the stack holds open, then it closes up again.

[Live demo](https://motion.rujilabs.com/patterns/exploded-view/) · [style.css](style.css)

## Use

Up to six parts and six labels, bottom layer first. The view is orthographic (no perspective), so each label rises exactly as far as its layer does on screen.

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="exploded-view/style.css">

<div class="xv-group">
  <label class="xv-pause"><input type="checkbox"> Pause</label>
  <div class="xv xv-loop" tabindex="0" role="img" aria-label="The layers of the handset">
    <div class="xv-object" aria-hidden="true">
      <div class="xv-part shell"></div>
      <div class="xv-part board"></div>
      <div class="xv-part glass"></div>
    </div>
    <ol class="xv-labels" aria-hidden="true">
      <li>Back shell</li>
      <li>Logic board</li>
      <li>Cover glass</li>
    </ol>
  </div>
</div>
```

Draw each `.xv-part` with backgrounds and an `inset` (a smaller part sits inside the outline). A darker copy under each plate gives it thickness.

## Variants

| Class or property | What it does |
|---|---|
| `.xv-loop` | Opens, holds, closes and holds on a `--xv-cycle` (6s) loop, layers one `--stagger` apart |
| `.xv-open` | Held apart. Toggle it from your own button or a scroll trigger; the move is a `--dur-slow` transition, top layer first out and last back |
| `--xv-gap` | Distance between layers when open. Default `34px` |
| `--xv-w`, `--xv-h` | Size of the object's outline. Default 170 by 100px |
| `--xv-label-x` | How far right of the object's centre the labels sit. Default `110px` |
| `.xv-pause` inside `.xv-group` | A checkbox that stops the loop. Hover and focus on the scene stop it too |

## Do

- Use it to explain what is inside a product, a building or a stack of software layers.
- Keep each layer a clearly different colour or texture, so the eye can count them.

## Do not

- Explode more than six layers: the stack gets taller than the frame, and labels crowd.
- Tilt it with perspective: the labels then drift away from their layers.

## Reduced motion

The scene shows the open state: every layer apart and labelled, with nothing moving, and the pause toggle hides.
