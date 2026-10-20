# Time-lapse

A long process compressed into a short loop: a whole day in 16 seconds. The sky changes colour, the sun crosses and the moon follows, a shadow swings across the ground and shortens at noon, windows light up at night, and a small clock races round. Every part runs on the same length, so they stay in step.

[Live demo](https://motion.rujilabs.com/patterns/time-lapse/) · [style.css](style.css)

## Use

```html
<section class="tl-group">
  <label class="tl-pause"><input type="checkbox"> Pause</label>
  <div class="timelapse">
    <div class="tl-sky"></div>
    <div class="tl-orbit"><span class="sun"></span><span class="moon"></span></div>
    <img src="square.png" alt="The town square">
    <div class="tl-night lights"></div>
    <svg viewBox="0 0 26 26"><path class="tl-hour" d="M13 13 V7"/><path class="tl-minute" d="M13 13 V4"/></svg>
  </div>
</section>
```

Position the parts yourself: `.tl-sky` fills the frame, `.tl-orbit` is a square centred on the horizon (put the sun at its top edge and the moon at its bottom edge), and `.tl-shadow` grows from its top edge, so start it at the foot of the thing casting it.

## Parts and options

| Class or property | What it does |
|---|---|
| `.timelapse` | The frame. Clips its contents and holds the settings below |
| `--tl-dur` | One day. Default `16s` |
| `--tl-dawn`, `--tl-day`, `--tl-dusk`, `--tl-night` | Sky colours |
| `.tl-sky` | Background colour through the day |
| `.tl-orbit` | Turns once a day: sunrise on the left at 0%, noon at 25%, sunset at 50% |
| `.tl-night` | Hidden by day, shows from dusk to dawn |
| `.tl-shadow` | Swings from the right to the left side through the day and is shortest at noon. Hidden at night |
| `.tl-hour`, `.tl-minute` | Clock hands on an SVG: 2 turns and 24 turns a day, starting at 6 o'clock |
| `.tl-drift` | Crosses the frame left to right twice a day (clouds, traffic). Stagger with a negative delay |
| `.tl-pause` inside `.tl-group` | A checkbox that pauses everything in the group |

## Do

- Use it to show that time passes: opening hours, a delivery window, a build that runs overnight.
- Keep the clock in view. Without it, a fast day looks like a broken light.

## Do not

- Change the length of one part: parts on another length drift out of step after the first day.
- Put text in the scene. Its contrast changes from day to night.

## Reduced motion

Everything stops on one still frame at 10 am: day sky, the sun up on the left, a short shadow, the clock at ten. The pause toggle hides.
