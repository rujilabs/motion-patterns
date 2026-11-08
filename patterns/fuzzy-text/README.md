# Fuzzy text

A big error code drawn in thin rows that drift sideways on smooth noise, like a signal that keeps slipping, with a faint coloured copy a step behind. Point at it, touch it, or tab into the panel and the noise calms down so the words read clean. For an outage or error page that should look broken without being hard to read.

[Live demo](https://motion.rujilabs.com/patterns/fuzzy-text/) · [style.css](style.css) · [fuzzy-text.js](fuzzy-text.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="fuzzy-text/style.css">
<script src="fuzzy-text/fuzzy-text.js" defer></script>

<section class="fz" id="err" data-fuzz=".07" data-fuzz-calm=".2">
  <h1><span class="fz-text">Error 503</span><canvas class="fz-canvas" aria-hidden="true"></canvas></h1>
  <p>Bookings are down for upkeep. Back by 3:15 am.</p>
  <button type="button" data-pause-for="err" aria-pressed="false">Pause</button>
</section>
```

Keep the text on one line: the script draws it as a single line, sized and placed over the real text. Give `.fz-text` `display: inline-block` so its box fits the words.

## Options

| Name | What it does | Default |
|---|---|---|
| `data-fuzz` | Largest sideways drift, as a share of the font size | `.07` |
| `data-fuzz-calm` | Share of the drift left while the pointer or focus is on the `.fz` | `.2` |
| `--fz-ink` | Colour of the text | the text colour |
| `--fz-ghost` | Colour of the faint copy behind it | `#e5484d` |
| `data-pause-for` | On a button: the id of the `.fz` it pauses. It sets `aria-pressed` | none |

Rows are 2 px tall. Each row sways at about 1 and 2 times a second and a soft tear drifts down every 5 seconds. Only position changes, never brightness, so there is no flashing.

## Do

- Use it once per page, on a short code or word: `Error 503`, `Offline`, `404`.
- Say what happened and when it will be back in plain text right under it.

## Do not

- Use it on body text, prices or anything people must read quickly.
- Raise `data-fuzz` past about `.12`. The letters start to come apart.

## Reduced motion

The canvas is never drawn: the plain text shows, still and sharp. Without the script it is the same.
