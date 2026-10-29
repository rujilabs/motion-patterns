# Drum word rotator

Use when: a hero headline names the different customers a product serves, as in "Built for cafes", then clinics, then tuition centres.

The changing word sits on a row of three-sided prisms, like a roadside tri-vision sign. Each slat is a triangular prism: three faces 120 degrees apart, each pushed out by the triangle's inradius so the edges meet. Every few seconds the slats turn one after another from the left, so the new word sweeps in across the old one. Each face gets darker as it turns away, by the cosine of its angle, so the slats read as solid. At rest a single flat copy of the word takes over, so the text is crisp.

[Live demo](https://motion.rujilabs.com/patterns/drum-word-rotator/) · [style.css](style.css) · [drum-word-rotator.js](drum-word-rotator.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="drum-word-rotator/style.css">
<script src="play.js"></script>
<script src="drum-word-rotator/drum-word-rotator.js" defer></script>

<h1>The till that is built for
  <span class="sr-only">cafes, clinics and tuition centres</span>
  <span class="prism" aria-hidden="true" data-words="cafes|clinics|tuition centres">cafes</span>
</h1>
<label><input type="checkbox" id="hold"> Pause the sign</label>
```

```js
const prism = document.querySelector(".prism");
hold.addEventListener("change", () => prism.pause(hold.checked));
prism.addEventListener("turn", (e) => showLineFor(e.detail.word)); // the new word starts to come round
```

The slats are cut after the web fonts load, to the width of the longest word. Screen readers get every word once from the hidden list, and the moving copy is `aria-hidden`.

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-words` | The words, separated by `\|`. Put the first one in the markup too | The text |
| `data-slats` | How many slats. More is smoother, fewer is chunkier, like a real sign | `9` |
| `data-every` | Milliseconds from one turn to the next | `2800` |
| `--prism-face` | Paint behind the word | Yellow |
| `--prism-ink` | The word's colour | Inherited |
| `--prism-drop` | `vertical-align` of the sign, to sit it on the line's baseline | `-.2em` |

Each turn takes `--dur-slow` (900 ms) on `--ease-inout`, the start and stop of a motor, plus 45 ms between slats.

## Do

- Keep the words short and the same kind of thing: types of shop, not a mix of features and places.
- Give people a pause control. It turns every 2.8 seconds for as long as it is on screen.
- Change something real with each word, like the line under the headline in the demo, through the `turn` event.

## Do not

- Put more than six words on it. Nobody waits for the seventh.
- Use it for a word people must read to understand the page. It is a flourish on top of a headline that already works.

## Reduced motion

The sign never turns. The first word stays, square to you, and screen readers still hear the full list.
