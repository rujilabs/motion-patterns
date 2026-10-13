# Odometer

Numbers that roll like counter wheels. The last digit spins the most, as many extra turns as the change really passed through (at most three), and the wheels start one after another from the left, so the number ripples into place and lands with a small settle.

[Live demo](https://motion.rujilabs.com/patterns/odometer/) · [style.css](style.css) · [odometer.js](odometer.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="odometer/style.css">
<script src="play.js"></script>
<script src="odometer/odometer.js" defer></script>

RM <span class="odometer" data-value="4416" data-decimals="2">4,416.00</span>
```

The first roll starts from zero when the number scrolls into view. To roll again, change the attribute:

```js
document.querySelector(".odometer").dataset.value = 4812.5;
```

It rolls from the number it shows to the new one, forward when the number goes up and backward when it goes down.

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-value` | The number to show. Change it to roll | Required |
| `data-decimals` | Digits after the point | `0` |
| `--odo-h` | Height of one digit | `1.15em` |
| `--odo-pad` | Room above and below each window for the fade | `.18em` |

Style the windows through `.odo-wheel` and the commas and points through `.odo-sep`. The demo gives each wheel a tinted window.

## Do

- Use it for a number that changes while someone watches: takings, tickets sold, a live count.
- Keep the plain number in the markup. It is what shows without the script, and what screen readers read.

## Do not

- Roll a number that changes every second. Each roll takes about a second and a half.
- Use it for long body numbers. It is for one figure per tile.

## Reduced motion

The wheels go straight to the new digits. Nothing rolls.
