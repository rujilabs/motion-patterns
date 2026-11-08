# Fold text

A title unfolds letter by letter like a strip of folded paper. Each letter panel starts folded flat back over its left edge, hinges open after the one before it, and a crease shadow lifts off it as it lands. Made for a crafts, paper or print title where the letters can sit on panels of their own.

[Live demo](https://motion.rujilabs.com/patterns/fold-text/) · [style.css](style.css) · [fold-text.js](fold-text.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="fold-text/style.css">
<script src="play.js"></script>
<script src="fold-text/fold-text.js" defer></script>

<h1 data-fold data-play>Lipat Bangau</h1>
```

`play.js` adds `go` when the title comes into view, and the panels unfold. The script splits the title into aria-hidden letter panels and keeps a visually hidden copy, so screen readers read "Lipat Bangau", not letters. Words never break across lines. To fold it again, remove `go`, read `offsetWidth`, and add `go` back.

The fold reads best when each letter has a panel: give `.fold-ch` a background, a width and a small radius (the demo uses four origami colours).

## Options

| Name | What it does | Default |
|---|---|---|
| `--stagger` | Delay between one panel and the next | token, `80ms` |
| `--dur-slow` | Time each panel takes to open | token, `900ms` |
| `perspective` on `.fold-word` | Depth of the fold; lower is more dramatic | `500px` |
| `.fold-ch::after` background | The crease shadow | dark at the hinge |

## Do

- Keep it to one short title, up to about 16 letters. Past that the last letter lands too late.
- Use it once per page, for the main title.

## Do not

- Do not fold body text or buttons: hidden letters cannot be read until they land.
- Do not drop the panel background on a light page: a bare letter folding reads as a flicker, not paper.

## Reduced motion

The panels show in place, open, from the start. Without JS the title is plain text.
