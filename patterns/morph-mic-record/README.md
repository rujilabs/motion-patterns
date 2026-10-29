# Mic record morph

Use when: a voice input button needs to show, at a glance, that it is listening and how to stop.

A dictation button. Tap it and the mic head squares off into a stop button while the U-shaped stand closes into a ring round it, so the button you press to stop is already the stop symbol. Tap again, or let it stop by itself, and the ring opens back into the stand. Each shape pair has the same path commands in the same order (a rounded rectangle for the head, four curves for the stand), so the browser moves point to point and nothing crumples halfway. The ring lags the square by a beat going in and leads it coming out.

[Live demo](https://motion.rujilabs.com/patterns/morph-mic-record/) · [style.css](style.css) · [morph-mic-record.js](morph-mic-record.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="morph-mic-record/style.css">
<script src="morph-mic-record/morph-mic-record.js" defer></script>

<button class="mic-record" type="button" aria-pressed="false"
        aria-label="Start dictation" data-label-off="Start dictation" data-label-on="Stop dictation">
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path class="mic-holder" d="M 5 10 C 5 10.67 5 11.33 5 12 C 5 15.87 8.13 19 12 19 C 15.87 19 19 15.87 19 12 C 19 11.33 19 10.67 19 10"/>
    <path class="mic-stem" d="M 12 19 L 12 22"/>
    <path class="mic-capsule" d="M 12 2 L 12 2 C 13.66 2 15 3.34 15 5 L 15 11 C 15 12.66 13.66 14 12 14 L 12 14 C 10.34 14 9 12.66 9 11 L 9 5 C 9 3.34 10.34 2 12 2 Z"/>
  </svg>
</button>
```

Start and stop your recorder from the event, and stop the button from code when the recorder stops on its own:

```js
button.addEventListener("mic-record", function (e) {
  if (e.detail.recording) recorder.start(); else recorder.stop();
});
recorder.onsilence = function () { MicRecord.set(button, false); };
```

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `aria-pressed` | The state. `true` shows the stop square and ring | `false` |
| `data-label-off`, `data-label-on` | The accessible name in each state | None |
| `MicRecord.set(button, on)` | Sets the state from code and fires the event | |
| `--mic-size` | Button diameter | `56px` |
| `--mic-bg`, `--mic-ink`, `--mic-line` | Idle face, icon and edge | White, near black, grey green |
| `--mic-live`, `--mic-live-ink` | Recording face and icon | Red, white |
| `--mic-morph` | Length of the morph | `420ms` |
| `--mic-capsule-off`, `--mic-capsule-on`, `--mic-holder-off`, `--mic-holder-on` | The shapes, as `path("...")` | Mic and stop |

The `d` attributes in the HTML are the idle shapes, for browsers that do not support the CSS `d` property. In those (Safari today), the script runs the same tween on the attribute.

## Do

- Keep the button where it is in both states. The point of the morph is that the stop control appears under the finger that started it.
- Change the colour with the shape. Red plus a square reads as "recording, press to stop" in every recorder people have used.
- Stop the button from code when the recording ends for any other reason (silence, a time limit, a lost mic), so the icon never lies.

## Do not

- Edit one shape of a pair without the other. Change both with the same commands in the same order, or the tween twists or jumps.
- Use it for a play button. Play and pause is [`shape-morph`](../shape-morph/).
- Pulse or loop the button while it records. The red face already says it; let the transcript or a level meter move instead.

## Reduced motion

The icon and colour swap at once. The state still changes on every press.
