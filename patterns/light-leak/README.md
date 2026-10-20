# Light leak

Warm light that got into the camera where it should not, washing in from the edges of the frame. Two soft, translucent washes in screen blend mode, red-orange on the left and amber on the right, drift slowly in and out. The switch holds them still.

[Live demo](https://motion.rujilabs.com/patterns/light-leak/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="light-leak/style.css">

<section class="look-leak-group">
  <figure class="look-leak">
    <img src="picnic.jpg" alt="A picnic in a park">
  </figure>
  <label class="look-leak-pause"><input type="checkbox"> Pause</label>
</section>
```

## Options

| Class or property | What it does |
|---|---|
| `--leak-a`, `--leak-b` | The colours of the left and right washes |
| `--leak-time` | Time for one slow drift on the left; the right one takes 1.3 times as long, so they never line up. Default `9s` |
| `.look-leak-still` | The washes, without any drift |
| `.look-leak-pause` inside `.look-leak-group` | A checkbox that holds the washes where they are |

## Do

- Keep the leaks at the edges; the subject in the middle stays clean.
- Use it on warm, light-hearted pictures: summer, travel, friends.

## Do not

- Put it behind text; the bright patches cut contrast where they pass.
- Use cold colours; a blue leak reads as a mistake, not a mood.

## Reduced motion

The washes stay at their resting strength, still, and the pause toggle hides.
