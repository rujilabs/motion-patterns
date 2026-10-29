# Keycap

Use when: a button has a keyboard shortcut and you want the button itself to teach it.

A button built like a keycap on a mechanical switch. The sculpted top face sits on a wider skirt, and the cap stands in a well whose bottom edge is the keyboard plate. A press moves the whole cap down by its travel, so the skirt slides behind the plate edge and the key gets shorter, the way a real key does. It bottoms out in 45 ms and comes back up on a spring. Typing the key on a real keyboard presses the cap on screen too.

[Live demo](https://motion.rujilabs.com/patterns/form-keycap/) · [style.css](style.css) · [keycap.js](keycap.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="form-keycap/style.css">
<script src="form-keycap/keycap.js" defer></script>

<button class="keycap" type="button" aria-keyshortcuts="B" aria-label="Bump order">
  <span class="keycap-well" aria-hidden="true">
    <span class="keycap-body"><span class="keycap-top">B</span></span>
  </span>
</button>

Press <kbd class="kbd-cap">B</kbd> to bump the ticket on top.
```

It is a real `<button>`: listen for `click` as usual. The shortcut key calls `click()` at the bottom of the travel, the way a switch actuates.

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `aria-keyshortcuts` | One letter or digit that presses this key from anywhere on the page (not while typing in a field) | None |
| `--key-w`, `--key-h` | Cap width, and its height above the plate at rest | `56px`, `50px` |
| `--key-skirt` | How much skirt shows under the top face | `11px` |
| `--key-travel` | How far the cap goes down. Keep it under `--key-skirt` | `5px` |
| `--key-cap`, `--key-side`, `--key-legend` | Top face, skirt and legend colours | Cream, sand, near black |
| `.kbd-cap` | A small static cap for shortcut hints in running text | |

Put the caps on a dark strip (a piece of plate) so the gap around them reads. The demo uses `#2b2a27`.

## Do

- Use it for the one action people repeat all day: bump an order, approve, next.
- Give it a real `aria-label` and the shortcut in `aria-keyshortcuts`, so screen readers announce both.
- Show the same letter in the hint text with `.kbd-cap`, so the shortcut is learned from the button.

## Do not

- Turn every button into a keycap. It is for the one with a shortcut.
- Bind a shortcut that browsers or screen readers use (single letters are fine only when focus is not in a field, which `keycap.js` checks).
- Raise `--key-travel` past the skirt: the top face would sink below the plate.

## Reduced motion

The cap still goes down and comes up, so a press is visible, but it jumps there with no travel or spring.

