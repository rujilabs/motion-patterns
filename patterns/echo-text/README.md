# Echo text

A name with outlined copies trailing behind it, like a call bouncing back off the hills. On load the copies ring out from under the text one after another and settle as a fading trail; hover or keyboard focus rings them again. Made for a short brand name or wordmark: a radio station, a podcast, a sound studio.

[Live demo](https://motion.rujilabs.com/patterns/echo-text/) · [style.css](style.css) · [echo-text.js](echo-text.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="echo-text/style.css">
<script src="echo-text/echo-text.js" defer></script>

<h1><a class="echo" href="/" data-echo="4">Angin Timur</a></h1>
```

The script adds the copies as `aria-hidden` spans behind the text, so screen readers read the name once. The copies use `currentColor`, so set the colour on `.echo`. Put it on a link or a button when you want focus to ring it.

## Options

| Name | What it does | Default |
|---|---|---|
| `data-echo` | Number of copies, 1 to 8 | `4` |
| `--echo-dx` / `--echo-dy` | Step between copies. A negative value trails the other way | `.07em` / `.05em` |
| `--echo-line` | Outline width of the copies | `1px` |
| `--stagger` | Delay between one copy and the next | token |

## Do

- Keep it to a few big words. The outlines need a large size to read as echoes and not as blur.
- Give the text room to the side the trail goes (`padding` on the parent), or it clips.

## Do not

- Do not use it on body text or a long heading: the copies make reading harder.
- Do not ring it on scroll or on a timer. Load, hover and focus are enough.

## Reduced motion

The trail shows in its place from the start and never moves.

Without JS there are no copies: the plain name shows.
