# Easing

The same move, run on five curves side by side, so the difference is felt rather than read: linear, ease-out, ease-in, ease-in-out and the spring, all from the shared tokens.

[Live demo](https://motion.rujilabs.com/patterns/easing/) · [style.css](style.css)

## Use

As a comparison bench:

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="easing/style.css">

<section class="ease-group">
  <label class="ease-pause"><input type="checkbox"> Pause</label>
  <div class="ease-lane lane-out"><span class="ease-dot"></span></div>
  <div class="ease-lane lane-spring"><span class="ease-dot"></span></div>
</section>
```

Or just to hand an element a curve:

```css
.drawer { transition: translate var(--dur-base) var(--lane-ease); }
```

```html
<aside class="drawer lane-out">...</aside>
```

## Curves

| Class | Token | Use for |
|---|---|---|
| `.lane-linear` | `linear` | Things that never start or stop on screen: a progress bar, a marquee, a spinner |
| `.lane-out` | `--ease-out` | Anything arriving: entries, panels opening, a dot landing. The default |
| `.lane-in` | `--ease-in` | Anything leaving the screen or hitting something: exits, a falling ball before impact |
| `.lane-inout` | `--ease-inout` | Moves that start and stop on screen: a thumb sliding between two places, a crossfade |
| `.lane-spring` | `--ease-spring` | Small things that should feel physical: a badge, a toggle, a tag. One clear overshoot, one settle |

## Options

| Property | What it does |
|---|---|
| `--lane-cycle` | Length of one loop, default 2.6s. The move itself takes 45% of it |
| `--lane-reach` | How far along the lane the finish sits, default `.8`, leaving room for the spring to overshoot |
| `--lane-dot` | Dot size, default 14px |
| `--lane-wait` | Delay before the first run, default .4s |

## Do

- Pick by what the thing is doing: arriving, leaving, or moving between two places on screen.
- Change the duration with the distance. A curve that feels right over 40px feels slow over 400px.

## Do not

- Put the spring on large areas such as cards or pages. Big things that wobble look like jelly.
- Use ease-in for something arriving. It starts slowly and then hits its place at full speed.

## Reduced motion

The dots wait at the finish and the curves beside them still show the difference. The pause toggle hides.

## Note

Set the curve with `animation-timing-function` on the element, as this pattern does. Chromium ignores a `var()` used for `animation-timing-function` inside `@keyframes`, so every lane would run linear.
