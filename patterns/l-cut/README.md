# L-cut

The previous scene's sound keeps going over the next scene's picture. On an editor's timeline the picture cuts first and the audio clip runs on under the new shot, which draws an L. On a page the "sound" is whatever stands for it: a caption, a speaker name, a level meter.

[Live demo](https://motion.rujilabs.com/patterns/l-cut/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="l-cut/style.css">

<section class="l-cut-group">
  <label class="l-cut-pause"><input type="checkbox"> Pause</label>
  <div class="l-cut" tabindex="0" role="group" aria-label="The picture cuts to the pier while Mira is still talking">
    <div class="l-cut-picture">
      <figure>...picture A...</figure>
      <figure>...picture B...</figure>
    </div>
    <div class="l-cut-audio">
      <p>Mira: go to the very end of the pier</p>
      <p>Dan: found it</p>
    </div>
  </div>
</section>
```

Lay the two parts out however you like (the demo puts the captions over the picture). For a timeline, put an `.l-cut-playhead` inside a positioned track and it crosses it once per loop.

## Timing

Both parts swap from A to B halfway through `--l-dur` (8s), on one frame, with no fade. The audio part runs `--l-lag` of the loop (14%, about 1.1s) behind, so B's picture arrives while A is still talking. The lag is a negative delay of one loop minus the lag, so the first pass is never blank. On the way round the loop B's sound stays over A's picture in the same way.

## Options

| Class or property | What it does |
|---|---|
| `.l-cut-picture` | Two picture layers, A then B |
| `.l-cut-audio` | Two sound layers, A then B; they switch late |
| `--l-lag` | How late the sound switches, as a share of the loop. Default `.14` |
| `--l-dur` | One full loop, both cuts. Default `8s` |
| `.l-cut-playhead` | A marker that crosses its positioned parent once per loop |
| `.l-cut-pause` inside `.l-cut-group` | A checkbox that stops the loop |

Hover and keyboard focus inside `.l-cut` stop it too.

## Do

- Use it to show what someone is talking about while they are still talking: the place, the result, the other person listening.
- End the carried line soon after the cut. The new picture needs its own sound to settle.

## Do not

- Carry a line that contradicts the new picture. The viewer reads them together.
- Confuse it with a J-cut. In an L-cut the old sound stays behind; in a [J-cut](../j-cut/) the new sound comes first.

## Reduced motion

Picture A and sound A show together, nothing switches, the playhead rests at the start, and the toggle hides.
