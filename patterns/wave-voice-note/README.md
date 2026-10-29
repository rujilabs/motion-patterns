# Wave voice note

Use when: a chat or support inbox plays voice messages, and people need to see how far in they are and jump back to a word.

The waveform of the message is a row of bars. As it plays, the bars fill with colour from the left, and the fill can stop halfway through a bar because the played colour is a second row of the same bars, clipped at the playhead. The two or three bars right at the playhead lift a little with the voice, more on loud syllables and hardly at all in the breaths. The wave is the slider: press anywhere on it and drag to scrub, and it keeps playing if it was playing. Play, pause, scrub and the 1x, 1.5x, 2x speed button all act on one Web Animation that lasts as long as the note, so its clock is the only source of truth.

[Live demo](https://motion.rujilabs.com/patterns/wave-voice-note/) · [style.css](style.css) · [wave-voice-note.js](wave-voice-note.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="wave-voice-note/style.css">
<script src="wave-voice-note/wave-voice-note.js" defer></script>

<div class="voice-note" data-duration="47" data-peaks="0.21,0.64,0.88,0.52,0.12,...">
  <button class="vn-play" type="button" aria-label="Play voice note">
    <svg class="vn-i-play" viewBox="0 0 14 14" aria-hidden="true">...</svg>
    <svg class="vn-i-pause" viewBox="0 0 14 14" aria-hidden="true">...</svg>
  </button>
  <div class="vn-wave" tabindex="0" aria-label="Voice note from Kak Ros, position"></div>
  <span class="vn-time">0:47</span>
  <button class="vn-rate" type="button" aria-label="Playback speed 1x">1x</button>
</div>
```

The script builds the bars and gives `.vn-wave` its `role="slider"`, `aria-valuenow` (seconds) and `aria-valuetext` ("0:12 of 0:47"). There is no audio in the pattern. In a real chat, wire it to an `<audio>` element:

```js
const note = document.querySelector(".voice-note");
note.addEventListener("play", () => audio.play());
note.addEventListener("pause", () => audio.pause());
audio.addEventListener("seeked", () => note.voiceNote.seek(audio.currentTime));
note.voiceNote.seek(12.5);   // also .play(), .pause(), .toggle()
```

`ended` fires when it reaches the end, and the note gets `.is-heard`. The demo turns the sender's mic badge grey with it.

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-duration` | Length of the note in seconds | `10` |
| `data-peaks` | One level per bar, 0 to 1, from the audio file (peak per slice) | Seeded speech shape |
| `data-seed`, `data-bars` | Without peaks: the seed and the number of bars for the made-up speech shape | `1`, `40` |
| `--vn-bar`, `--vn-fill` | Bars not played, played bars and thumb | Grey pink, plum |
| `--vn-h`, `--vn-bar-w` | Wave height, widest bar | `30px`, `3px` |

Keys on the wave: Left and Right move one second, Page Up and Page Down five, Home and End go to the start and the end, Space or Enter plays and pauses. The bars sit in one grid column each, so any number of bars fits any bubble width; they thin out on a narrow phone.

## Do

- Work the peaks out once, when the note is uploaded, and store them with the message. About 40 levels is enough for a chat bubble.
- Show the total length before it is played and the elapsed time once it has started, like the demo.

## Do not

- Animate the bars while the note is not playing. A still wave is the waiting state.
- Play two notes at once. Pause the others on `play`, as the demo does.

## Reduced motion

The fill moves a whole second at a time instead of sweeping, the bars at the playhead do not lift, and the thumb does not grow while you drag. Playing and scrubbing work the same.
