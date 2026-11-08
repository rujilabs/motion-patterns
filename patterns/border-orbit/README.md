# Border orbit

Use when: one plan in a row of plans is the one you want picked, and it should stand out without a louder colour or a bigger badge.

A soft light runs round the card's border, slowly, like a lamp moving round a display case. The border is a conic gradient behind the card face; its start angle, `--orbit`, is registered with `@property`, so the browser can tween it and the bright part of the gradient travels round the edge. A blurred copy behind it gives the light a glow on the page. It needs no script.

[Live demo](https://motion.rujilabs.com/patterns/border-orbit/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="border-orbit/style.css">

<section class="orbit-group">
  <label class="orbit-pause"><input type="checkbox"> Pause</label>
  <div class="orbit">
    <div class="orbit-face">
      <h2>Rumah 500</h2>
      <p>500 Mbps, RM 139.00 a month</p>
    </div>
  </div>
</section>
```

`.orbit-face` holds the content and must have an opaque background: the light is drawn behind it and only the border width shows.

## Options

| Property or class | Does | Default |
|---|---|---|
| `--orbit-c` | Colour of the light. A white core is added in the middle | `#3d7bf2` |
| `--orbit-base` | The border colour where the light is not | `rgb(0 0 0 / .1)` |
| `--orbit-bg` | Background of `.orbit-face` | `#fff` |
| `--orbit-w` | Border width | `2px` |
| `--orbit-r` | Corner radius | `16px` |
| `--orbit-dur` | Time for one lap | `6s` |
| `.orbit-pause` in an `.orbit-group` | A checkbox that stops the light where it is | |

## Do

- Put it on one card only. Two orbiting cards compete and neither wins.
- Keep the lap slow, 5 seconds or more. Faster reads as a loading state.
- Keep the pause control: the loop never ends.

## Do not

- Put it on a button that is not ready yet. A moving border reads as "working".
- Make the border thicker than about 3 px. It turns from a light into a stripe.

## Reduced motion

The light stops at the top right corner and stays there, so the card still stands out.

Browsers without `@property` cannot tween the angle; the animation goes from 0deg to 360deg, which look the same, so the light rests near the top left corner.
