# Blur in text

A hero line whose words sharpen out of a blur and rise a little, one after another, like a lens finding focus as you read. A second line can follow on its own, quicker beat.

[Live demo](https://motion.rujilabs.com/patterns/blur-in-text/) · [style.css](style.css) · [blur-in-text.js](blur-in-text.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="blur-in-text/style.css">
<script src="play.js"></script>
<script src="blur-in-text/blur-in-text.js" defer></script>

<h1 class="blur-in" data-play>Breathe slower, stand taller, leave a little lighter.</h1>
<p class="blur-in" data-play>Hatha at 7:15 am, yin at 6:45 pm.</p>
```

Write the line as plain text. The script wraps each word; `em`, `strong` and `br` inside it are kept.

## Options

| Property or attribute | Does | Default |
|---|---|---|
| `--bi-step` | Time between one word and the next | `110ms` |
| `--bi-delay` | Wait before the first word, to follow another line | `0s` |
| `--bi-blur` | How blurred a word starts. Smaller text wants less | `12px` |
| `data-play` | Starts it when the line comes into view (play.js) | |
| `[data-replay]` button in the same `.frame` | Plays every line in it again | |

## Do

- Keep it to the one line that opens the page, and maybe the line under it.
- Shorten `--bi-step` for long lines so the last word lands within about 2 seconds.

## Do not

- Use it on body text or on anything people need to read straight away, such as a price or an error.
- Blur large photos the same way. Filters on big areas are slow on phones.

## Reduced motion

Every word shows sharp and in place at once.
