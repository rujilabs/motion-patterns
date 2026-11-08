# Glass icons

Use when: a panel of on and off switches (lights, devices, features) should show at a glance what is on, with the light itself saying so.

Each switch is a real button with `aria-pressed`. Its icon is a frosted glass pane sitting on a coloured plate. Off, the plate is grey and tucked behind the pane. Switched on, the plate takes its colour, swings out from behind the glass on a spring, and its light shows through the frost: the glyph turns white with a soft glow, and one bloom swells past the resting glow and settles. Off again, the colour fades and the plate tucks back.

[Live demo](https://motion.rujilabs.com/patterns/glass-icons/) · [style.css](style.css) · [glass-icons.js](glass-icons.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="glass-icons/style.css">
<script src="glass-icons/glass-icons.js" defer></script>

<button class="glass-icon" type="button" aria-pressed="false">
  <span class="glass-art" aria-hidden="true">
    <span class="glass-plate"></span>
    <span class="glass-pane"><svg viewBox="0 0 24 24">...</svg></span>
  </span>
  <span>Porch light</span>
</button>
```

```js
document.addEventListener("change", (e) => {
  if (e.target.matches(".glass-icon")) send(e.target, e.target.getAttribute("aria-pressed") === "true");
});
```

The look comes only from `aria-pressed`, so if your app sets the attribute itself (a device reports its state), the icon follows. Keep the visible on and off words `aria-hidden`: the pressed state already tells a screen reader.

## Options

| Name | What it does | Default |
|---|---|---|
| `--glass-color` | The plate's colour when on, and its glow | `#f2b53a` |
| `--glass-size` | Size of the icon | `64px` |
| `blur(9px)` on `.glass-pane` | How frosted the glass is | |

Where `backdrop-filter` is missing, the pane is a plain milky gradient and the plate shows as a coloured edge; it still reads.

## Do

- Give each kind of device its own colour, and use it the same way everywhere.
- Say the change in a `role="status"` line when one switch affects a total, as the demo does with the power used.

## Do not

- Do not use it for actions that are not on or off (open the gate, run once). Those are plain buttons.
- Do not rely on colour alone: keep the on and off words next to each icon.

## Reduced motion

The plate, colour and glow change at once, with no swing and no bloom.
