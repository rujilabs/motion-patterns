# Burst

Small shapes fly out from one point and fade: a like, a save, a task marked done. The icon in the middle gives one springy beat as they leave.

[Live demo](https://motion.rujilabs.com/patterns/burst/) · [style.css](style.css)

## Use

The ring holds eight empty elements and sits inside a `position: relative` box, after a checkbox. No script: checking the box plays it, unchecking resets it.

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="burst/style.css">

<label class="like">
  <input type="checkbox">
  <span class="heart">
    <svg class="burst-pop">...</svg>
    <span class="burst" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>
  </span>
  Like
</label>
```

```css
.heart { position: relative; }
```

## Variants

| Class or property | What it does |
|---|---|
| `.burst` | Eight dots in `currentColor` fly out to `--burst-r` (26px) and shrink away. Even dots go 70% as far |
| `.burst-confetti` | Paper slips instead of dots: they spin, drop `--burst-drop` (10px) and take `--burst-c2` and `--burst-c3` as second and third inks |
| `.burst-pop` | The icon in the middle scales up from 60% on the spring |
| `.go` | Plays the burst without a checkbox, for example after a save request succeeds |
| `--burst-size` | Dot size, default 6px |
| `--burst-turn` | Turns the whole ring, default -22.5deg so no dot points straight sideways |
| `--burst-delay` | Wait before it starts |

## Do

- Keep it to the moment of a positive action the person just took. It is a thank you, not decoration.
- Size the radius to the icon: about one and a half icon widths reads as a burst, more reads as an explosion.

## Do not

- Burst on page load, or on something the page did by itself.
- Use it for errors or deletes. Those want a calm state change, not a celebration.

## Reduced motion

The bits never show and the icon does not scale. The checkbox still changes state and colour at once.
