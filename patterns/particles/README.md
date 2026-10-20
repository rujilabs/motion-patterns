# Particles

A quiet field of small dots behind a section: they rise like bubbles or drift like dust in light. It gives a sense of air or of something going on, without saying anything.

[Live demo](https://motion.rujilabs.com/patterns/particles/) · [style.css](style.css) · [particles.js](particles.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="particles/style.css">
<script src="particles/particles.js"></script>

<section class="particles-group">
  <label class="particles-pause"><input type="checkbox"> Pause</label>
  <div class="hero particles-rise" data-particles="28" data-seed="11">
    <h1>24:13</h1>
  </div>
</section>
```

The script puts an `aria-hidden` layer of dots behind the element's content. The dots take the element's `color`.

## Options

| Class or attribute | What it does |
|---|---|
| `data-particles` | Number of dots, default 24. Stay under about 60 |
| `data-seed` | Any whole number. The same seed draws the same field every time |
| `.particles-rise` | Dots float up from below the bottom edge over 9 to 18 seconds, swaying and fading |
| `.particles-drift` | Dots wander slowly around where they were placed |
| `.particles-pause` in `.particles-group` | A checkbox that pauses the field |

Each dot gets its own place, size (2 to 6px), speed, sway and strength, and starts part-way through its run, so the field is full from the first frame.

## Do

- Keep the dots faint and slow, behind content that does not move. They are the room, not the subject.
- Use one colour, a step lighter than the background's ink, as the demo does in blue pencil.

## Do not

- Put particles behind body text or a form. Moving dots behind words make them harder to read.
- Use them to mean progress or data. People will try to read meaning into the dots.

## Reduced motion

The dots are drawn where they were placed and stay still. The pause toggle hides.

## Performance

Each dot is one small CSS animation of `translate` and `opacity`, which browsers run off the main thread. The field pauses itself while it is off screen.
