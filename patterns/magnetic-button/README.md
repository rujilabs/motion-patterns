# Magnetic button

When a mouse comes near, the button drifts a few pixels toward it and its label leans a little further, so the face seems to turn to the pointer. When the pointer leaves, it springs home.

[Live demo](https://motion.rujilabs.com/patterns/magnetic-button/) · [style.css](style.css) · [magnet.js](magnet.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="magnetic-button/style.css">
<script src="magnetic-button/magnet.js"></script>

<a class="btn magnet" href="/call"><span class="magnet-label">Book a call</span></a>
```

## Options

| Class or attribute | What it does |
|---|---|
| `.magnet` | The button that drifts |
| `.magnet-label` | Optional, inside it. Moves 40% further than the button, which gives the lean |
| `data-magnet-reach` | How close, in pixels from the button's edge, the pull starts. Default `60` |
| `data-magnet-pull` | Share of the distance to the pointer it follows. Default `.35` |
| `data-magnet-max` | The cap in pixels. Default `12` |

The script only writes `--magnet-x` and `--magnet-y`; a CSS transition does the easing. Near, it is a 200ms ease-out that keeps up with the hand. Leaving, it is the spring from `tokens.css`, which settles with one small wobble.

## Do

- Use it on one main action per screen. Its job is to say "this one".
- Keep the cap small (8 to 14px). A button that travels far is hard to hit.

## Do not

- Put it on buttons in a row or a toolbar: they pull against each other.
- Move the button's hit area with JavaScript layout changes. This pattern only uses `translate`, so the layout never shifts.

## Reduced motion

The script does not start and the button stays put. Touch screens and pens never get the pull: it needs a mouse that hovers.
