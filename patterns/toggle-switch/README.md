# Toggle switch

A checkbox drawn as a switch. The knob is held by its two edges and the leading edge moves first, so the knob stretches toward its new side and then gathers itself, while the track fills out from under it. Press and hold leans the knob toward where it is about to go. CSS only.

[Live demo](https://motion.rujilabs.com/patterns/toggle-switch/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="toggle-switch/style.css">

<label class="toggle">
  <input type="checkbox" role="switch" checked>
  <span>New orders</span>
  <span class="toggle-track" aria-hidden="true"><span class="toggle-knob"></span></span>
</label>
```

The input must come before the track inside the label; the text can go before or after the track.

## Options

| Property | What it does | Default |
|---|---|---|
| `--toggle-on` | Fill colour when on | `#3d7bf2` |
| `--toggle-off` | Track colour when off | `#c9d1dc` |
| `--toggle-knob` | Knob colour | `#fff` |
| `--toggle-w`, `--toggle-h`, `--toggle-pad` | Track size and the gap around the knob (set on `.toggle-track`) | `44px`, `24px`, `3px` |
| `--toggle-lag` | How far the trailing edge runs behind the leading one | `--stagger` x .9 |

## Do

- Use a switch for a setting that takes effect at once. Keep `role="switch"` so screen readers say on and off.
- Make the whole row the label, so the text is a target too.

## Do not

- Use a switch inside a form that only saves on submit. That is a checkbox.
- Raise `--toggle-lag` past about 100ms: the knob starts to look like it is struggling.

## Reduced motion

The knob and the fill jump to their new state with no stretch.
