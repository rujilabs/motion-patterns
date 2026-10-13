# Stamp

A label pressed onto the surface: it falls in fast, squashes on contact and settles at a tilt. Plus an ink variant for seals like "Paid".

[Live demo](https://motion.rujilabs.com/patterns/stamp/) · [style.css](style.css)

## Use

```html
<span class="sticker stamp tilt-l">Handmade</span>
<p class="seal stamp-ink" role="status">Paid</p>
```

## Variants

| Class | What it does |
|---|---|
| `.stamp` | Falls from 1.3x on an accelerating curve, squashes to 96% on contact, settles at `--tilt` |
| `.stamp-ink` | Lands from 1.6x with a slight blur, settles at 88% opacity with `mix-blend-mode: multiply`. Default tilt -8deg |
| `.stamp-in` | Add to either; holds it until `play.js` adds `.go` |
| `.tilt-l`, `.tilt-r` | -3deg and 4deg. Or set `--tilt` in your own class |

## Do

- Stamp one or two things per view: a status, a price, a label. Impacts lose their weight when they repeat.
- Give a status seal `role="status"` so screen readers announce it.

## Do not

- Use `.stamp-ink` on a dark surface: multiply blending makes it disappear.
- Stamp text people need to read at length.

## Reduced motion

Both variants show in place at their final tilt.
