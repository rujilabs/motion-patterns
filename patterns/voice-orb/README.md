# Voice orb

Use when: a bank hotline, support line or voice assistant call screen wants a glowing orb that swells with the caller's voice level and rests in grey while they are muted.

A WebGL fragment shader draws a lit orb on the call screen. While the caller talks it swells, its edge wobbles and rings grow out from it; in the pauses it settles to a slow breath. Press Mute and it eases to grey and rests, so the caller can see at a glance that the agent cannot hear them. The demo simulates a believable speaking voice in code: no microphone is asked for or used.

[Live demo](https://motion.rujilabs.com/patterns/voice-orb/) · [style.css](style.css) · [voice-orb.js](voice-orb.js)

## Use

```html
<link rel="stylesheet" href="voice-orb/style.css">
<script src="voice-orb/voice-orb.js" defer></script>

<section class="voiceorb">
  <canvas class="vo-canvas" aria-hidden="true"></canvas>
  <div class="call">
    <h1>Card services</h1>
    <p>On call 02:41, Nurul, desk 14</p>
    <button type="button" class="vo-mute" aria-pressed="false" hidden>Mute</button>
  </div>
  <button type="button" class="vo-pause" aria-pressed="false" hidden>Pause</button>
</section>
```

The canvas fills the `.voiceorb` behind the call screen. The script shows the Mute and Pause buttons, sets `aria-pressed` on them, and puts `is-muted` on the `.voiceorb` so your own copy can change with it (the demo swaps "Nurul can hear you" for "You are muted").

To drive it from a real call, give the element a function that returns the current level, 0 to 1 (from your call SDK's audio level, or a Web Audio analyser you already have):

```js
document.querySelector(".voiceorb").voiceOrbLevel = function () { return call.localAudioLevel; };
```

## Options

| Name | What it does | Default |
|---|---|---|
| `--vo-x`, `--vo-y` | Orb centre, fractions of the box from the top left. Read on every resize, so a media query can move it | `0.7`, `0.45` |
| `--vo-size` | Orb radius, a fraction of the box height (0.05 to 0.45) | `0.24` |
| `--vo-bg` | The call screen (6 digit hex) | `#0d1a17` |
| `--vo-core` | Orb centre (6 digit hex) | `#4fe0b5` |
| `--vo-rim` | Orb edge and rings (6 digit hex) | `#f2c14e` |
| `--vo-mute` | The orb when muted (6 digit hex) | `#7d8a86` |
| `el.voiceOrbLevel` | A function returning the live level, 0 to 1, read every frame. Without it the simulated voice plays | none |

The simulated voice runs on a Web Animations clock ("voice level"), so the gallery timeline and the Pause button both stop it.

## Do

- Keep Mute next to the call controls, and change the words as well as the orb. Colour alone does not tell everyone they are muted.
- Use your brand's two colours for core and rim; the grey should sit well below both.

## Do not

- Do not ask for the microphone just to animate the orb. Use the level your call already has, or the simulation.
- Do not make the orb the only sign the line is live. Keep the timer and the agent's name in text.

## Reduced motion

One still frame is drawn with the orb at a middle level, and nothing moves; the Pause button hides. Mute still works and redraws the still in grey. Without WebGL or script, the canvas keeps a CSS still: the orb at rest with a soft halo, and the Mute button stays hidden.

## How it works

- One full-screen triangle; the fragment shader does all the work.
- The simulated voice is a seeded table of phrases (1.1 to 3.4 seconds, with breaths and longer pauses for the agent's turn), each made of syllables about five a second, every syllable a sin squared bump with its own peak. It is read at the clock time, then smoothed like a level meter: fast attack (45 ms), slow release (170 ms).
- The edge is a circle whose radius is pushed by value noise read round a circle in noise space (so the edge has no seam), more as the level rises. The noise is read from a 64 x 64 random texture with linear filtering on smoothstepped coordinates.
- Inside, the disc is shaded as a sphere: z = sqrt(1 - r squared) gives a normal, lit from the top left, with a Fresnel rim in the edge colour and a small highlight. Outside, an exponential halo and two rings that grow out, 20 per loop.
- The fast turns (noise offsets, rings, breathing) are worked out in JS as whole multiples of the loop and passed in, because big angles lose precision at `mediump`.
- Muted, the colour is mapped to a grey of the same brightness and the level eases to zero. The drawing buffer is at most 1.5 times the CSS size, 1 times if the first 30 frames average over 20 ms. Drawing stops off screen, in a hidden tab and when paused and settled, the context is released on `pagehide` and rebuilt after `webglcontextlost`.
