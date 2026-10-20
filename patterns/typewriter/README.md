# Typewriter

Text appears one character at a time behind a blinking caret. It waits a little at commas and longer at full stops, the way a person types.

[Live demo](https://motion.rujilabs.com/patterns/typewriter/) · [style.css](style.css) · [typewriter.js](typewriter.js)

## Use

```html
<link rel="stylesheet" href="typewriter/style.css">
<script src="typewriter/typewriter.js"></script>

<!-- one line -->
<p data-type data-type-speed="35">Saturday stall, final plan</p>

<!-- several lines, typed as one run -->
<div data-type-group data-type-speed="24" data-type-delay="1300">
  <p data-type>Hi Ravi,</p>
  <p data-type>The tent goes up at 7.</p>
</div>
```

## Options

| Attribute or property | What it does |
|---|---|
| `data-type` | Types this element. Plain text only: markup inside it is flattened |
| `data-type-group` | Types its `data-type` children one after another, with a short breath between lines. Only the last line keeps the caret |
| `data-type-speed` | Milliseconds per character, default 40. Commas wait 4 times as long, full stops 7 times |
| `data-type-delay` | Milliseconds before the first character |
| `--type-caret` | Caret colour, default `currentColor` |
| `--type-caret-w` | Caret width, default 2px |

Every character holds its place from the start, invisible, so a multi-line paragraph is laid out once and never jumps while it fills in. For a single line that must not wrap, add `white-space: nowrap` yourself.

## Do

- Use it for text the interface is producing: a suggestion, an assistant reply, a terminal line.
- Keep the whole run under about three seconds. Raise the speed for longer text rather than make people wait.

## Do not

- Type a heading or anything someone came to read. They will try to read it before it is there.
- Type text that changes often. Every update replays the whole run.

## Reduced motion

Nothing is split: the text is there at once, with no caret.

## Accessibility

A visually hidden copy carries the whole text for screen readers; the typed characters are `aria-hidden`. Without the script, the text simply shows.
