# Wave flag picker

Use when: people pick a country site (and with it the language, currency and ways to pay), and the one they chose should stand out from the row.

A row of flags on poles. The chosen flag waves and the others hang still. The waving flag is cut into thin vertical strips, each one showing its own slice of the same SVG. A wave runs from the pole to the free end: each strip moves up and down by a sine of its distance and the time, with a height that is zero at the pole and grows toward the fly end, as on a real flag held at one edge. Each strip is tilted to the local slope of the wave, so neighbours meet without steps, and shaded by that slope: lighter where the cloth faces up to the light, darker where it turns away. A newly chosen flag catches the wind over two waves; the one it replaces loses it over 1.4 seconds, from wherever it was in its swing, and hangs flat again. Every strip is one Web Animation of one wave period, looped.

[Live demo](https://motion.rujilabs.com/patterns/wave-flag-picker/) · [style.css](style.css) · [wave-flag-picker.js](wave-flag-picker.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="wave-flag-picker/style.css">
<script src="wave-flag-picker/wave-flag-picker.js" defer></script>

<ul class="flag-picker" role="listbox" aria-label="Country site">
  <li role="option" aria-selected="true" data-site="my">
    <span class="fp-flag"><svg viewBox="0 0 28 14" aria-hidden="true">
      <!-- the flag, in its own proportions -->
      <rect class="fp-edge" width="100%" height="100%"/>
    </svg></span>
    <span class="fp-name" lang="ms">Bahasa Melayu</span>
  </li>
  <li role="option" aria-selected="false" data-site="id">...</li>
</ul>
```

```js
picker.addEventListener("change", (e) => switchSite(e.detail.option.dataset.site));
picker.flagPicker.pause();     // the wind drops: the flag stops where it is
picker.flagPicker.play();
picker.flagPicker.select(2);   // choose from code
```

Draw each flag as an SVG with its real proportions (Malaysia 1:2, Indonesia, Japan, Thailand and Vietnam 2:3); the picker sets the height and the width follows. `.fp-edge` is an optional hairline inside the flag, so a white flag still has an edge on a white page; it waves with the cloth.

## Options

| Property | Does | Default |
|---|---|---|
| `--fp-h` | Flag height | `40px` |
| `--fp-pole` | Pole and finial colour | Grey |
| `--fp-ring` | Focus ring | Navy |

A wave takes 1.15 s to pass and is about as long as the flag, with a height of a tenth of the flag at the free end. The flag starts to wave when the picker scrolls into view. Keys: arrows move the choice, Home and End jump to the ends, Enter or Space picks the focused option. The choice follows focus, as in any single-choice listbox.

## Do

- Write each language in its own script (日本語, ภาษาไทย) and add the country, as the demo does. The flag says where; the words say which language.
- Give the page a pause control, like the demo's Wind switch. The chosen flag waves for as long as it is chosen.

## Do not

- Use flags alone for languages. A language is not a country: use this where the choice really is a country site.
- Wave more than one flag. The motion is the mark of the choice.

## Reduced motion

The chosen flag shows one still frame of the wave, curved and shaded, so it still reads as the flag that is flying. Nothing moves when the choice changes; the curve just moves to the new flag.
