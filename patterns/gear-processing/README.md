# Gear processing

Use when: a job takes a few seconds (an export, a report, a payroll run) and you want the wait to look like work being done.

Meshing gears with real involute teeth turn while the job runs. Every gear turns by the same number of teeth, so the 12-tooth gear spins two and a half times for each turn of the 30-tooth one, and in the other direction. Each gear sits on its partner's pitch circle with its phase set so a tooth always meets a gap. The train spins up, runs and spins down on one shared curve, and the progress you show is read off the gears themselves.

[Live demo](https://motion.rujilabs.com/patterns/gear-processing/) · [style.css](style.css) · [gear-processing.js](gear-processing.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="gear-processing/style.css">
<script src="play.js"></script>
<script src="gear-processing/gear-processing.js" defer></script>

<svg class="gear-processing" data-module="4" role="img" aria-label="Three meshing gears">
  <g class="gp-gear gp-drive" data-teeth="30"></g>
  <g class="gp-gear" data-teeth="12" data-mesh="0" data-dir="-32"></g>
  <g class="gp-gear" data-teeth="20" data-mesh="1" data-dir="38"></g>
</svg>
```

Run the job, and drive your own progress text from the gears:

```js
GearProcessing.run(svg, {
  teeth: 48,          // how far every gear turns, in teeth
  duration: 3600,
  onFrame: function (p) { bar.style.transform = "scaleX(" + p + ")"; },
  onDone: function () { button.disabled = false; }
});
```

## Options

| Attribute or option | Does | Default |
|---|---|---|
| `data-module` (on the svg) | Tooth size in svg units. Meshing gears must share it | `4` |
| `data-teeth` | Tooth count of this gear | Required |
| `data-mesh` | Index of the gear this one meshes with | none: the driver |
| `data-dir` | Angle in degrees from that gear's centre to this one's | `0` |
| `.gp-drive` | Colours the driver with `--gp-drive` | |
| `teeth` | How many teeth pass the mesh in one run. A whole number leaves every gear looking as it started | `48` |
| `duration` | Run time in ms | `3600` |
| `--gp-steel`, `--gp-drive`, `--gp-axle`, `--gp-shadow` | Colours | grey steel, amber |

The svg sizes its own `viewBox` to fit the train unless you set one.

## Do

- Keep the run short and tied to a real job. The gears stop when the work stops.
- Use 3 or 4 gears with clearly different tooth counts, so the speed difference reads.

## Do not

- Leave the gears turning as decoration. A train that never stops reads as a stuck job.
- Mesh gears with different `data-module` values. Real teeth of different sizes cannot mesh.
- Use fewer than 10 teeth. Involute teeth that small come to a point.

## Reduced motion

Nothing turns. `onFrame(1)` and `onDone` run at once, so the job shows as finished.
