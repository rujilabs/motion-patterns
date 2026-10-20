# Glitch

A broken signal in short bursts. Most of the cycle nothing moves; then for about a third of a second the element jitters, two colour copies split off to either side, and thin slices of them jump sideways. Every keyframe holds instead of easing, because a real glitch snaps.

[Live demo](https://motion.rujilabs.com/patterns/glitch/) · [style.css](style.css)

## Use

Text needs its own words in `data-text`. An image is placed three times; the copies are hidden from screen readers.

```html
<link rel="stylesheet" href="glitch/style.css">

<span class="glitch" data-text="Weak connection">Weak connection</span>

<div class="glitch-img">
  <img src="photo.jpg" alt="What the picture shows">
  <img class="glitch-copy" src="photo.jpg" alt="" aria-hidden="true">
  <img class="glitch-copy" src="photo.jpg" alt="" aria-hidden="true">
</div>
```

## Options

| Class or property | What it does |
|---|---|
| `.glitch` | Text. The copies are `::before` and `::after`, so the element cannot use its own |
| `.glitch-img` | An image or any block, with two `.glitch-copy` siblings of the original |
| `.glitch-hover` | Plays one burst on hover or focus instead of looping |
| `.glitch-pause` inside a `.glitch-group` | A checkbox that stops every loop in the group |
| `--glitch-every` | Length of one cycle; the burst is its last tenth. Default `4s` |
| `--glitch-a`, `--glitch-b` | The two split colours. Default red and blue |

## Do

- Tie it to something that is actually broken or unstable: a dropped connection, a corrupted file, an error page.
- Keep the bursts rare. Four seconds apart reads as a fault; one second apart reads as decoration.

## Do not

- Put it on text people need to read in that moment, such as a form error. Say the error plainly.
- Let it loop with no pause: the flashes can bother people with vestibular or seizure sensitivity. Keep the toggle.

## Reduced motion

Nothing moves and the colour copies are removed, so only the plain text or image shows. The pause toggle hides.
