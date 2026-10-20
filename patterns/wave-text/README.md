# Wave text

Letters rise and fall in a wave that travels across a word from left to right. Each pass is short and the word rests between passes, so it stays readable.

[Live demo](https://motion.rujilabs.com/patterns/wave-text/) · [style.css](style.css) · [wave.js](wave.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="wave-text/style.css">
<script src="wave-text/wave.js"></script>

<section class="wave-group">
  <h2 data-wave>Slow Tide</h2>
  <label class="wave-pause"><input type="checkbox"> Pause the wave</label>
</section>
```

The script splits the text into letters and numbers them; the CSS moves them.

## Options

| Class or property | What it does |
|---|---|
| `data-wave` | Splits this element into letters. Plain text only: markup inside it is flattened |
| `--wave-h` | How high a letter rises, default `.25em` |
| `--wave-step` | Delay from one letter to the next, default `80ms`. Smaller makes a longer, flatter wave |
| `--wave-dur` | One full cycle, bump and rest, default `2.4s`. The bump takes a quarter of it |
| `.wave-flag` | On the element or a parent: letters also tip as they rise, like cloth |
| `.wave-pause` inside `.wave-group` | A checkbox that pauses the wave |

Words never break across lines, and a space counts as one step so the wave keeps its pace between words.

## Do

- Use it on one short word or title that is meant to feel alive: a track playing, a voice listening, a sign.
- Leave line height room above the text: letters rise out of the line box.

## Do not

- Wave a sentence or a button label. People read moving letters slowly.
- Use it on several things at once. One wave on a page is a pulse; three are noise.

## Reduced motion

The text is not split and stays still, and the pause toggle hides.

## Accessibility

A visually hidden copy carries the text for screen readers; the moving letters are `aria-hidden`. Without the script, the text simply shows.
