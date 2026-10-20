# Wipe

The next view replaces the current one behind a moving edge. Three edges: a straight line that sweeps from left to right, a clock hand that sweeps once round from twelve, and an iris that opens from the centre.

[Live demo](https://motion.rujilabs.com/patterns/wipe/) · [style.css](style.css)

## Use

A loop of three views, each one entering with the wipe its class names:

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="wipe/style.css">

<section class="wipe-group">
  <label class="wipe-pause"><input type="checkbox"> Pause</label>
  <div class="wipe-loop" tabindex="0" role="group" aria-label="The lighthouse at noon, dusk and night">
    <figure class="wipe-linear">...</figure>
    <figure class="wipe-clock">...</figure>
    <figure class="wipe-iris">...</figure>
  </div>
</section>
```

Or one wipe, started by your own script: stack the two views, then add `.wipe-in` and a wipe class to the incoming one.

```js
next.classList.add("wipe-in", "wipe-iris");
```

## Timing

In the loop each view gets `--wipe-slot` (3s): a 900ms wipe on `--ease-inout`, then a hold. The incoming view sits on top while it wipes and the old one stays whole under it, so nothing blank ever shows through. The one-shot classes take `--wipe-dur` (1.2 times `--dur-slow`).

## Options

| Class or property | What it does |
|---|---|
| `.wipe-linear` | A straight edge, left to right |
| `.wipe-clock` | A hand from twelve o'clock, once round. Uses a registered `--wipe-a` angle and a conic mask |
| `.wipe-iris` | A circle from the centre, until it reaches the corners |
| `.wipe-loop` | Three stacked views that take turns |
| `.wipe-in` | Plays the wipe once on the element |
| `--wipe-slot`, `--wipe-dur` | Slot length in the loop (3s), length of a one-shot wipe |
| `.wipe-pause` inside `.wipe-group` | A checkbox that stops the loop |

Hover and keyboard focus on the views stop the loop too.

## Do

- Pick the edge for its meaning: linear for the next step, clock for time passing, iris for opening onto something.
- Keep one kind of wipe per sequence on a real page. The demo mixes them only to show all three.

## Do not

- Wipe between two views that look almost the same. The edge then reads as a glitch, not a change.
- Run the wipe faster than about 600ms on a large frame. The edge turns into a flash.

## Reduced motion

The loop shows only the first view and the toggle hides; a one-shot wipe shows the new view at once.

## Browser support

The clock wipe needs `@property` (all current browsers). Without it the view appears at the end of the wipe instead of sweeping in.
