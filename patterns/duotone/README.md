# Duotone

The picture is mapped to two colours: its darkest tone becomes the dark colour, its lightest the light colour. In the demo the grade fades in, then the colour pair changes slowly between three pairs. The switch pauses it.

[Live demo](https://motion.rujilabs.com/patterns/duotone/) · [style.css](style.css)

## Use

A still duotone:

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="duotone/style.css">

<figure class="look-duotone">
  <img src="team.jpg" alt="The team on the office steps">
</figure>
```

A pair that changes, with a pause toggle:

```html
<section class="look-duotone-group">
  <figure class="look-duotone look-duotone-cycle">
    <img src="team.jpg" alt="The team on the office steps">
  </figure>
  <label class="look-duotone-pause"><input type="checkbox"> Pause</label>
</section>
```

## Options

| Class or property | What it does |
|---|---|
| `--duo-dark`, `--duo-light` | The two colours of a still duotone. Default navy `#27306b` and peach `#f3c7a4` |
| `.look-duotone-cycle` | Moves through three pairs, holding each. Set them with `--duo-dark-1` to `-3` and `--duo-light-1` to `-3` |
| `--duo-cycle` | Time for all three pairs. Default `15s` |
| `--duo-contrast` | Contrast on the grey picture before it is coloured. Default `1.1` |
| `data-play` on the frame or an ancestor | The grade fades in once the frame is in view (`play.js`) |
| `.look-duotone-pause` inside `.look-duotone-group` | A checkbox that pauses the cycle |

## Do

- Pick a dark colour that is really dark and a light colour that is really light; close pairs turn to mud.
- Use one pair across a set of pictures so they read as one family.

## Do not

- Cycle pairs behind text people are reading.
- Use it on pictures of food or skin where true colour matters.

## Reduced motion

Nothing moves. The frame shows the first pair, still, and the pause toggle hides.
