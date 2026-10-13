# Drift

Slow ambient float for clouds, water, balloons and other background life. It never looks like a loop.

[Live demo](https://motion.rujilabs.com/patterns/drift/) · [style.css](style.css)

## How it works

Horizontal movement, vertical movement and a slight tilt each run on their own cycle: 7s, 11s and 13s. The three lengths share no factor, so the combined path only repeats every 1001 seconds. The eye never catches the loop, which is what makes it read as floating rather than swinging.

It uses the individual `translate` and `rotate` properties (and registered custom properties for x and y), so it sits on top of whatever `transform` the element already has instead of replacing it.

## Use

```html
<g class="drift">…</g>
<g class="drift drift-2">…</g>
```

## Options

| Class or property | What it does |
|---|---|
| `--drift-amp` | Travel width. Default `10px`; vertical travel is 60% of that. Keep it at 12px or less |
| `.drift-2`, `.drift-3` | Start at a different point of each cycle, so neighbours never move together |
| `.drift-slow` | Longer cycles (11s, 17s, 19s) for big or distant shapes |

## Do

- Give every drifting thing on a screen a different phase class.
- Use it for background life while the content holds still.

## Do not

- Drift text, buttons or anything people need to read or hit.
- Raise `--drift-amp` to make it more noticeable. Ambient motion should be felt, not watched.

## Browser support

Uses `@property`, supported by every current major browser. Where it is missing, the element tilts gently but stays in place.

## Reduced motion

Everything stays still in its resting position.
