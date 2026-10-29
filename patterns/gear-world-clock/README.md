# Gear world clock

Use when: people in different cities have to agree a meeting time, and you want them to see every clock move together.

One gear train drives a clock per city. Turn any wheel round its centre, or focus the train and use the keys, to set the meeting time; every clock follows through the teeth. The city wheels share a tooth count and sit two idlers apart, so they all turn the same way at the same speed, as they would in a real train, while the 12-tooth idlers spin twice as fast the other way. Each city wheel carries its hour hand, a minute hand rides on each dial at twelve to one, and a dial goes dark between 7 pm and 6 am local time.

[Live demo](https://motion.rujilabs.com/patterns/gear-world-clock/) · [style.css](style.css) · [gear-world-clock.js](gear-world-clock.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="gear-world-clock/style.css">
<script src="gear-world-clock/gear-world-clock.js" defer></script>

<div class="gear-world-clock" tabindex="0" aria-label="Meeting time in Kuala Lumpur" data-start="840" data-step="15">
  <svg data-module="7.5" aria-hidden="true">
    <g class="gw-gear gw-city" data-teeth="24" data-offset="-480" data-city="London"></g>
    <g class="gw-gear" data-teeth="12" data-mesh="0" data-dir="32"></g>
    <g class="gw-gear gw-city" data-teeth="24" data-mesh="1" data-dir="-32" data-offset="-240" data-city="Dubai"></g>
    <g class="gw-gear" data-teeth="12" data-mesh="2" data-dir="32"></g>
    <g class="gw-gear gw-city" data-teeth="24" data-mesh="3" data-dir="-32" data-offset="0" data-city="Kuala Lumpur"></g>
  </svg>
</div>
```

The train is one `role="slider"`. Its value is minutes past midnight in the home city, and `aria-valuetext` reads every city ("5:00 pm in Kuala Lumpur, 1:00 pm in Dubai, 9:00 am in London"). Listen for `clockchange` (`detail.minutes`, `detail.cities`) to write the times out, and call `el.setTime(minutes)` from your own buttons.

## Options

| Attribute | Does | Default |
|---|---|---|
| `data-start` | Starting time, minutes past midnight at home | `0` |
| `data-step` | Snap step in minutes, and the arrow key step | `15` |
| `data-module` (on the svg) | Tooth size in svg units | `7.5` |
| `data-offset` (city wheel) | Minutes from home time, negative to the west | `0` |
| `data-mesh`, `data-dir` | The wheel this one meshes with, and the angle to it | |
| Keys | Arrows by one step, Page Up and Page Down by an hour, Home and End for the ends of the day | |

## Do

- Put an idler between every pair of city wheels, or a city wheel will run backwards.
- Write the times out in text too. A 12 hour dial does not say am or pm.

## Do not

- Give city wheels different tooth counts. Their clocks would run at different speeds.
- Use it for more than 4 cities. The wheels get too small to read.

## Reduced motion

Keys and buttons jump the train straight to the new time. Dragging still turns it, because the drag is the input, and a release snaps without easing.
