# Bell toggle

Use when: someone turns an alert on or off, and turning it on should sound like the alert it sets, such as prayer time reminders.

A checkbox switch drawn as a bell. Turn it on and the bell fills with colour and rings: it swings about its hanger on a decaying sine, and the clapper swings about the same point a beat behind, so it knocks the rim at each turn, while two sound arcs pulse out on the first strikes. It is still in about a second. Turn it off and a slash draws across the outline. The ring plays only on the change to on, never on page load.

[Live demo](https://motion.rujilabs.com/patterns/bell-toggle/) · [style.css](style.css) · [bell-toggle.js](bell-toggle.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="bell-toggle/style.css">
<script src="bell-toggle/bell-toggle.js" defer></script>

<label class="bell">
  <span>Asar, 4:15 pm</span>
  <input type="checkbox" role="switch">
  <span class="bell-btn" aria-hidden="true">
    <svg viewBox="0 0 40 40">
      <path class="bell-wave" d="M7.5 12.5Q4.5 18 7.5 23.5"/>
      <path class="bell-wave" d="M32.5 12.5Q35.5 18 32.5 23.5"/>
      <g class="bell-swing">
        <g class="bell-clap"><circle cx="20" cy="30.6" r="2.6"/></g>
        <path class="bell-body" d="M20 8.5c-5.4 0-8.6 4-8.6 9.2v5.6L8.6 27.6h22.8l-2.8-4.3v-5.6c0-5.2-3.2-9.2-8.6-9.2z"/>
        <path d="M20 8.5V6"/>
      </g>
      <path class="bell-slash" d="M9 9 31 31"/>
    </svg>
  </span>
</label>
```

The input comes right before `.bell-btn`. It is a real checkbox with `role="switch"`: Tab reaches it, Space flips it, a screen reader says on or off, and the form gets its value. Both the bell and the clapper turn about the hanger at (20, 6) in the SVG, so keep that point if you draw your own bell. `label.ring()` rings it again without changing the value, for a "test the alert" button.

## Options

Set these on `.bell`.

| Property | Does | Default |
|---|---|---|
| `--bell-on` | Bell colour when on, and the focus ring | `#1f7a52` |
| `--bell-off` | Outline and slash colour when off | `#9aa3ae` |
| `--bell-tint` | Circle behind the bell when on | `#e2f2e9` |

In `bell-toggle.js`, `A` is the first swing in degrees, `F` the swings a second and `TAU` how fast it dies away.

## Do

- Make the whole row the label, so the name and time are a target too.
- Keep the ring for the change to on. Turning an alert off is quiet.

## Do not

- Ring every bell on page load, or several at once from a "turn all on" button. One ring is a confirmation, five is noise.
- Push `A` past about 30 degrees: the bell starts to look thrown rather than rung.

## Reduced motion

The bell fills and the slash goes at once. No swing, no clapper, no sound arcs.

## See also

[`form-rocker-switch`](../form-rocker-switch/), a switch drawn as a hardware rocker.
