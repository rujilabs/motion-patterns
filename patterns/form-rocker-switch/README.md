# Rocker switch

Use when: a settings list has on and off choices that should feel like hardware, such as which messages someone gets.

A checkbox drawn as a rocker switch. The paddle has two faces set in a shallow V and tips about its centre pivot in 3D, so the half that is pressed in lies flush in the bezel's shadow while the other half stands up toward you, larger in perspective and catching the light. The lamp behind the I lights at the middle of the throw, when the contacts close, not when the paddle lands. A press makes the paddle give a little first, then it goes over centre, hits its stop and knocks back a touch, the way a real bistable switch does.

[Live demo](https://motion.rujilabs.com/patterns/form-rocker-switch/) · [style.css](style.css) · [rocker.js](rocker.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="form-rocker-switch/style.css">
<script src="form-rocker-switch/rocker.js" defer></script>

<label class="rocker">
  <span>Appointment reminder</span>
  <input type="checkbox" role="switch" checked>
  <span class="rocker-bezel" aria-hidden="true">
    <span class="rocker-paddle">
      <span class="rocker-face rocker-off">O</span>
      <span class="rocker-face rocker-on"><span class="rocker-lamp"></span>I</span>
    </span>
  </span>
</label>
```

The input comes right before the bezel. It is a real checkbox with `role="switch"`: Tab reaches it, Space flips it, screen readers say on or off, and `change` fires as usual.

## Options

Set these on `.rocker-bezel`.

| Property | Does | Default |
|---|---|---|
| `--rocker-w`, `--rocker-h` | Paddle size | `78px`, `42px` |
| `--rocker-tilt` | How far each half tips. Also the angle of the V | `11deg` |
| `--rocker-paddle`, `--rocker-bezel` | Paddle and bezel colours | Graphite, near black |
| `--rocker-mark` | Colour of the O and I | Off white |
| `--rocker-lamp` | Lamp colour when on | Amber `#f6a623` |
| `--rocker-ring` (on `.rocker`) | Focus ring colour | `#3d7bf2` |

Leave out `.rocker-lamp` for an unlit rocker.

## Do

- Use it where each change takes effect at once, and say so ("Changes save as you flip them").
- Make the whole row the label, so the text is a target too.
- Keep the switch the same colour in dark mode. It is an object on the wall, not a themed surface.

## Do not

- Use it for a choice that is only saved on submit. That is a checkbox.
- Push `--rocker-tilt` past about 14deg: the faces start to look folded rather than tipped.

## Reduced motion

The paddle, its light and the lamp go straight to the new side. No give, no snap, no knock back.

## See also

[`toggle-switch`](../toggle-switch/), the flat sliding switch.
