# Check cube

Use when: a task list should feel good to tick off, one item at a time.

A checkbox that turns over like a cube. The empty box is the front face and the ticked face waits on top. Checking tips the cube forward a quarter turn about its own centre, so the ticked face rolls to the front while the empty one turns down and away. Each face darkens as it turns from the light. The cube lifts a little while it turns, so its edge does not cut into the table, and its contact shadow tightens. The tick draws once the face has landed, then a line strikes through the task from the left, line by line when it wraps.

[Live demo](https://motion.rujilabs.com/patterns/form-check-cube/) · [style.css](style.css) · [cube.js](cube.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="form-check-cube/style.css">
<script src="form-check-cube/cube.js" defer></script>

<label class="cube-check">
  <input type="checkbox">
  <span class="cube-box" aria-hidden="true"><span class="cube-lift"><span class="cube">
    <span class="cube-face cube-front"></span>
    <span class="cube-face cube-top"><svg class="cube-tick" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" pathLength="1"/></svg></span>
  </span></span></span>
  <span class="cube-text"><span class="cube-words">Line the tin with baking paper, twice</span></span>
</label>
```

It is a real checkbox: Tab reaches it, Space ticks it, screen readers read the label, and `change` fires as usual. The turn is CSS, so it works without `cube.js`; the script only adds the lift.

## Options

Set these on `.cube-box`.

| Property | Does | Default |
|---|---|---|
| `--cube` | Edge length | `22px` |
| `--cube-paper`, `--cube-edge` | The empty face and its border | White, dark brown |
| `--cube-done`, `--cube-tick` | The ticked face and the tick | Red `#b1342b`, white |
| `--cube-turn` | How long the quarter turn takes, spring included | `520ms` |
| `--cube-text-done` (on `.cube-check`) | Colour of a finished task | `#8b8079` |
| `--cube-ring` (on `.cube-check`) | Focus ring colour | `#3d7bf2` |

Leave out `.cube-text` for a bare checkbox.

## Do

- Use it in lists people work through: prep lists, packing lists, onboarding steps.
- Keep the cube small, around one line of text tall. The turn is the reward, not a show.

## Do not

- Put dozens on screen and tick them all at once with "Select all". The cube is for one hand-made tick at a time.
- Give the ticked face a gradient. Flat colour reads as a face of a solid; the shading does the rest.

## Reduced motion

The cube shows the ticked face straight away, the tick and the strike line appear at once, and nothing lifts.
