# Letter rain glitch

A wall of characters that flickers quietly behind a maintenance or downtime notice, so the page looks like work is going on while the notice stays easy to read. Slow drops run down the columns (5 to 11 rows a second) and light the characters they pass, which fade back over 1.6 s. Now and then one character changes. Every 2.6 to 5.6 s one or two rows slip sideways by one to three characters for 220 ms and snap back. It is calm on purpose: a character changes at most once every 1.5 s, slips come at most once every 2.6 s, and nothing flashes.

[Live demo](https://motion.rujilabs.com/patterns/letter-rain-glitch/) · [style.css](style.css) · [letter-rain-glitch.js](letter-rain-glitch.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="letter-rain-glitch/style.css">
<script src="letter-rain-glitch/letter-rain-glitch.js" defer></script>

<section class="letter-rain">
  <canvas class="lr-canvas" aria-hidden="true"></canvas>
  <div class="notice">
    <h1>We are moving your accounts to a new server tonight.</h1>
    <p>Sunday 15 November, 1:00 am to 4:30 am.</p>
    <button type="button" data-pause aria-pressed="false">Pause background</button>
  </div>
</section>
```

The script wires the `button[data-pause]` inside the wall: it toggles `aria-pressed` and its label. Give the notice a solid background.

## Options

| Name | What it does | Default |
|---|---|---|
| `--lr-size` | Character size; cells are 0.78 of it wide and 1.35 tall | `14px` |
| `--lr-char` | The wall. Keep it close to the background | Linen grey |
| `--lr-head` | Characters a drop has just passed | Teal |
| `canvas.letterRain.pause()`, `.play()` | Stop and start it from your own code | |

Time runs on a Web Animation called "letter rain", so pausing that animation also stops the wall. Only cells that change are redrawn, from a sheet of pre-drawn glyphs, so a phone does little work per frame.

## Do

- Keep `--lr-char` within a few shades of the background. The wall is texture; the notice is the message.
- Say when the service comes back, in text, on the notice.

## Do not

- Do not turn it into a bright green on black "hacker" screen. A downtime page should calm people, not alarm them.
- Do not speed the drops or the slips up. The limits keep it well under three changes a second in any one place.

## Reduced motion

The wall is drawn once, with three trails held still, and the pause button is hidden. Without the script the notice shows on the plain background.
