# Light pull cord

Use when: a site's light and dark theme should be switched by something people already know how to use, a pull chain on a lamp.

A ball chain hanging from a sprung switch, simulated, not keyframed. The beads are Verlet points joined by fixed-length links under gravity. Drag the handle down: the chain goes taut and drags the switch along its 14 px travel, and at 9 px it clicks, so the theme flips on the pull, the way a real pull switch does, not on the release. Let go and the switch spring snaps back to its stop. That yanks the chain up; it goes slack, falls and jerks taut again, and the heavy wooden handle bounces a couple of times before it hangs still. Pull to one side and the chain swings on its way back. The chain cannot stretch: past full travel, the handle stays at the end of it.

In the demo the lamp is the theme: the bulb lights in 70 ms and cools over 260 ms, and its pool of light on the paper uses the same point-light falloff as [`light-pointer-spotlight`](../light-pointer-spotlight/).

[Live demo](https://motion.rujilabs.com/patterns/light-pull-cord/) · [style.css](style.css) · [light-pull-cord.js](light-pull-cord.js)

## Use

```html
<link rel="stylesheet" href="light-pull-cord/style.css">
<script src="light-pull-cord/light-pull-cord.js" defer></script>

<div class="pull-cord" data-target="#page" data-length="104">
  <button type="button" class="pull-handle" role="switch" aria-checked="true" aria-label="Light theme"></button>
</div>
```

```css
#page[data-theme="dark"] { --paper: #1c1714; --ink: #eadfce; }
```

```js
cord.addEventListener("pullcord", (e) => localStorage.theme = e.detail.on ? "light" : "dark");
cord.cord.pull();   // give it a pull from code
```

The handle is a real `role="switch"` button, so the state is announced. On start the script reads `data-theme` from the target, or the system colour scheme when there is none: put a saved choice there and it starts from that.

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-target` | Selector of the element whose `data-theme` is switched | `html` |
| `data-length` | Chain length in px. Set `--pull-length` to the same | `104` |
| `data-beads` | Beads in the chain. More is smoother and heavier to run | `14` |
| `data-on`, `data-off` | The `data-theme` values for lit and dark | `light`, `dark` |
| `--pull-chain`, `--pull-wood`, `--pull-wood-dark`, `--pull-ring` | Chain, handle and focus ring colours | Brass, oak |
| `.is-on`, `.is-pulling` | Classes on the root: lit, and held | |
| `pullcord` | Event after each click, `detail.on` | |

Keys: Tab to the handle, Enter or Space gives it a short pull. A tap without a drag does the same.

## Do

- Hang it where a lamp would be, near the top of the thing it lights.
- Start from the theme the reader asked for (`prefers-color-scheme`, or what they picked last time).
- Keep the hint in words next to it. Not everyone has pulled a light cord.

## Do not

- Flip the theme on release. The click is at the bottom of the pull; that is the moment people feel.
- Fade the whole page over a second. A bulb is on in a blink and off in a quarter of a second.
- Make it the only way to switch theme in a real product. Keep the toggle in the settings too.

## Reduced motion

The switch clicks at once on Enter, Space or a tap. A drag still moves the handle, since the drag is the input, but on release the chain hangs straight again with no bounce and no swing.

## See also

[`toggle-switch`](../toggle-switch/), the flat version of the same job.
