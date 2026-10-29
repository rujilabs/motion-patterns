# Door reveal

Use when: a promo hides a code or a prize behind something people open themselves, such as a festive voucher.

A pair of doors in front of the thing you reveal. Each door is a real slab: a front face, a back face one thickness behind it, and the edge between them on the swinging side, so the edge shows as the door turns. The doors swing toward you, each about its outer hinge, on its own damped spring: the second door follows the first a beat late, and both go a little past their stop and settle, like heavy wood. Light follows the angle: a front face darkens as it turns away from you, the back catches the room's light once a door swings past square, and the room itself brightens as the gap opens. Drag a door and it follows your hand while the other one is pulled along behind; a flick carries it open or shut.

[Live demo](https://motion.rujilabs.com/patterns/panel-door-reveal/) · [style.css](style.css) · [doors.js](doors.js)

## Use

```html
<link rel="stylesheet" href="panel-door-reveal/style.css">
<script src="play.js"></script>
<script src="panel-door-reveal/doors.js" defer></script>

<div class="doorway">
  <div class="doorway-inside" id="code">ANANDA12, RM 12 off any box over RM 80</div>
  <button class="doors" type="button" aria-expanded="false" aria-controls="code">
    <span class="doors-label">Open the doors</span>
    <span class="door door-l" aria-hidden="true">
      <span class="door-face door-front"></span>
      <span class="door-face door-edge"></span>
      <span class="door-face door-back"></span>
    </span>
    <span class="door door-r" aria-hidden="true">
      <span class="door-face door-front"></span>
      <span class="door-face door-edge"></span>
      <span class="door-face door-back"></span>
    </span>
  </button>
</div>
```

The doors are one button, so Tab reaches them and Enter or Space opens them. While they are shut the inside is `inert`, so a screen reader only reaches the code once the doors are open. Without the script the doors are drawn open.

## Options

| Attribute or property | Does | Default |
|---|---|---|
| `data-open-angle` on `.doorway` | How far the doors swing, in degrees | `104` |
| `--door-wood`, `--door-wood-back`, `--door-wood-edge` | Front, back and edge colours | Teak |
| `--door-t` | Door thickness | `12px` |
| `--door-ring` | Focus ring | Teal `#1b6f6a` |
| Width and height of `.doorway` | The opening. Each door is half of it | `240px` by `300px` |
| `doorsopen`, `doorsclose` | Events on `.doorway`, once the doors come to rest | |
| `doorway.doors.set(true)` | Opens or shuts them from code | |

## Do

- Leave room either side of the doorway. Open doors stand out past the frame toward you, about a third of their width.
- Put the code in real text inside, so it can be copied once the doors are open.
- Draw panels and handles on `.door-front` in your own stylesheet; the demo's carving is in `page.css`.

## Do not

- Hide anything that matters behind the doors for people who cannot open them: the code is inert while shut, so also send it by email or show it after checkout.
- Swing them past about 120 degrees in a narrow column. They cover the text beside them.

## Reduced motion

The doors are simply open or shut: no swing, no lag between them, no overshoot.

## See also

[`drum-combo-lock`](../drum-combo-lock/), a hamper opened by a code, and [`drum-slot-voucher`](../drum-slot-voucher/).
