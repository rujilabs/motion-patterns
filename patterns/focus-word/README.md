# Focus word

A tagline with a camera's focus frame on it. Four thin corner brackets step from word to word on a loop; the word inside them is sharp and the others go soft, so the line is read one word at a time. Point at a word and the frame jumps there and stays.

[Live demo](https://motion.rujilabs.com/patterns/focus-word/) · [style.css](style.css) · [focus-word.js](focus-word.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="focus-word/style.css">
<script src="focus-word/focus-word.js" defer></script>

<div class="fw-group">
  <h1>
    <span class="fw" tabindex="0" aria-describedby="hint">
      <span class="fw-w">Sharp</span> <span class="fw-w">photos</span> <span class="fw-w">for</span>
      <span class="fw-w">small</span> <span class="fw-w">shops.</span><span class="fw-frame" aria-hidden="true"></span>
    </span>
  </h1>
  <p id="hint">Point at a word, or Tab here and use the arrow keys.</p>
  <label class="fw-pause"><input type="checkbox"> Pause</label>
</div>
```

## Options

| Property or attribute | Does | Default |
|---|---|---|
| `data-step` on `.fw` | Time on each word, in ms | `1800` |
| `--fw-c` | Bracket colour | `currentColor` |
| `--fw-l` | Length of each bracket arm | `12px` |
| `--fw-pad` | Room between the word and the brackets | `6px` |
| `--fw-blur` | How soft the other words go | `4px` |
| `.fw-pause` in the same `.fw-group` | A checkbox that pauses the loop | |

| Input | Does |
|---|---|
| Pointer on a word | Moves the frame there and holds it until the pointer leaves the line |
| Tab to the line | Holds the loop |
| Left, Right, Home, End | Previous, next, first or last word |

## Do

- Keep the tagline to about 3 to 7 words. Each word gets its turn, so a long line takes too long to come round.
- Keep enough contrast that the soft words can still be read.

## Do not

- Use it on a sentence people must read in one go, such as an address or a price.
- Make the blur heavy. The soft words are there to be glanced at, not hidden.

## Reduced motion

No loop and no blur: the line is plain and sharp, and the frame is not drawn.
