# J-cut

The next scene's sound starts before its picture. On an editor's timeline the audio clip reaches back under the end of the previous shot, which draws a J. On a page the "sound" is whatever stands for it: a caption, a speaker name, a level meter.

[Live demo](https://motion.rujilabs.com/patterns/j-cut/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="j-cut/style.css">

<section class="j-cut-group">
  <label class="j-cut-pause"><input type="checkbox"> Pause</label>
  <div class="j-cut" tabindex="0" role="group" aria-label="The announcement is heard before the platform is seen">
    <div class="j-cut-picture">
      <figure>...picture A...</figure>
      <figure>...picture B...</figure>
    </div>
    <div class="j-cut-audio">
      <p>Office: keys tapping</p>
      <p>Platform: the 18:40 is arriving</p>
    </div>
  </div>
</section>
```

Lay the two parts out however you like (the demo puts the captions over the picture). For a timeline, put a `.j-cut-playhead` inside a positioned track and it crosses it once per loop.

## Timing

Both parts swap from A to B halfway through `--j-dur` (8s), on one frame, with no fade. The audio part runs `--j-lead` of the loop (14%, about 1.1s) ahead, so B's sound arrives first and B's picture follows. On the way round the loop A's sound leads A's picture back in the same way.

## Options

| Class or property | What it does |
|---|---|
| `.j-cut-picture` | Two picture layers, A then B |
| `.j-cut-audio` | Two sound layers, A then B; they switch early |
| `--j-lead` | How early the sound switches, as a share of the loop. Default `.14` |
| `--j-dur` | One full loop, both cuts. Default `8s` |
| `.j-cut-playhead` | A marker that crosses its positioned parent once per loop |
| `.j-cut-pause` inside `.j-cut-group` | A checkbox that stops the loop |

Hover and keyboard focus inside `.j-cut` stop it too.

## Do

- Use it to pull the viewer forward: the sound of the next place makes them want to see it.
- Keep the lead short, about one second. Longer and the sound feels wrong for the picture.

## Do not

- Lead with a caption that only makes sense after the picture changes. The early sound has to be readable on its own.
- Confuse it with an L-cut. In a J-cut the new sound comes first; in an [L-cut](../l-cut/) the old sound stays behind.

## Reduced motion

Picture A and sound A show together, nothing switches, the playhead rests at the start, and the toggle hides.
