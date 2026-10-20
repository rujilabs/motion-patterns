# Kinetic type

A headline built word by word on a beat, ending in one word that keeps swapping. Every word lands on the same rhythm, so the line reads like a phrase being said rather than a list appearing.

[Live demo](https://motion.rujilabs.com/patterns/kinetic-type/) · [style.css](style.css)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="kinetic-type/style.css">

<section class="kt">
  <label class="kt-pause"><input type="checkbox"> Pause</label>
  <h1>
    <span class="kt-up kt-at-1">Small</span> <span class="kt-up kt-at-2">shop.</span><br>
    <span class="kt-up kt-at-3">We</span> <span class="kt-up kt-at-4">fix</span>
    <span class="kt-sr">bikes, brakes and gears.</span><span class="kt-swap kt-at-5" aria-hidden="true"><span>bikes.</span><span>brakes.</span><span>gears.</span></span>
  </h1>
</section>
```

## Parts

| Class or property | What it does |
|---|---|
| `.kt` (parent) | Holds the rhythm: `--kt-beat` (300ms between words) and `--kt-hold` (1.6s per swap word) |
| `.kt-at-1` to `.kt-at-8` | The beat a word lands on |
| `.kt-up` | Rises half a line into place |
| `.kt-slide` | Comes in from the left |
| `.kt-slam` | Lands from 170% on the spring. One per headline, on the word that matters |
| `.kt-swap` | 2 to 5 stacked words take turns, the old one leaving upward as the new one rises in. Starts on its own beat |
| `.kt-sr` | Visually hidden text, so screen readers hear every swap word once |
| `.kt-pause` | A checkbox that pauses the swap. Hover on the swap pauses it too |

## Do

- Read the headline aloud and set the beats to the way you said it. Short words can share a beat with the next.
- Put the swap at the end of a line. Its cell is as wide as its widest word, so text after it would sit at a gap.

## Do not

- Animate more than one headline per screen. Kinetic type asks for the whole page's attention.
- Put information only in the swap, like a price or a date. Half the time it shows something else.

## Reduced motion

Every word is in place at once and the swap stops on its first word. The pause toggle hides.
