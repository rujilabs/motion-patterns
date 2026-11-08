# Scroll float text

A headline whose letters float up into place one after another as it scrolls into view. Each letter starts a little low, faded and tilted, and settles upright on its line; scroll back and they sink again. For the big section headlines of a long page.

[Live demo](https://motion.rujilabs.com/patterns/scroll-float-text/) · [style.css](style.css) · [scroll-float-text.js](scroll-float-text.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="scroll-float-text/style.css">
<script src="scroll-float-text/scroll-float-text.js" defer></script>

<h2 data-float-text>Musang King, RM 68 a kilo</h2>
```

The script splits plain text only: put no inline tags inside the heading. Letters stay inside their words, so a line only breaks between words. Screen readers read one hidden copy of the whole heading, not letter by letter.

## Options

| Property on the heading | What it does | Default |
|---|---|---|
| `--sf-rise` | How far below its line a letter starts | `.75em` |
| `--sf-from` | Where in the heading's view timeline the first letter starts (`cover` range) | `4%`, just after it comes up from the bottom |
| `--sf-span` | How much of the timeline the whole headline takes to land | `26%` |

Each letter floats over the space of six letters, so a soft wave runs along the headline rather than one letter at a time. Tilts alternate between 3 and 8 degrees each way.

## Browser support

Chromium browsers scrub the letters with the scroll. Elsewhere the script adds `.go` when the heading is 40% in view, and the letters float in once on a 28 ms stagger over 900 ms.

## Do

- Use it on a few short, big headlines, one per section.
- Keep at least a screen of other content between two of them, so each one gets its moment.

## Do not

- Put it on body text, buttons or navigation.
- Use it on a headline near the very top of the page. It would start half landed, or never get to scroll in.

## Reduced motion

The script does nothing: the headline is plain text, in place from the start.
