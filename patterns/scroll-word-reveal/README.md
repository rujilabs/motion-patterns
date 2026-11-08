# Scroll word reveal

A paragraph starts faint and inks in one word at a time as the reader scrolls down, so the words light up at the pace of reading. Scroll back up and they fade again.

[Live demo](https://motion.rujilabs.com/patterns/scroll-word-reveal/) · [style.css](style.css) · [scroll-word-reveal.js](scroll-word-reveal.js)

## Use

Write the text as normal and mark each block. The script wraps the words; inline tags such as `<em>` stay.

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="scroll-word-reveal/style.css">
<script src="scroll-word-reveal/scroll-word-reveal.js"></script>

<p data-word-reveal>My grandfather opened these shutters at 5:40 am on a Tuesday in 1961.</p>
```

## Options

| Property on the block | What it does |
|---|---|
| `--wr-faint` | Opacity of a word before it inks. Default `.2` |
| `--wr-from` | Where in the block's view timeline the first word starts (`cover` range). Default `18%`, just after the block comes up from the bottom |
| `--wr-span` | How much of the timeline the whole block takes to ink. Default `42%`. Larger is slower |

Each word fades in over the space of three words, so the edge between ink and faint is soft, not a hard cursor.

## Browser support

Chromium browsers scrub the words with the scroll. Elsewhere the script adds `.go` when the block is half in view, and the words ink once on a 25 ms stagger.

## Do

- Use it on one short, important block: a founder's letter, a mission line, a pull quote.
- Keep the faint state readable (`.2` or more), so nobody has to scroll to read a word.

## Do not

- Run it on body copy, forms or anything people scan. Long text that only reads when scrolled is tiring.
- Put it on a block taller than the screen. The bottom words would wait for scrolling the reader cannot do yet.

## Reduced motion

The script does nothing: the text stays plain and full ink from the start.
