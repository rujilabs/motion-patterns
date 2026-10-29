# Shutter menu

Use when: a phone site's main menu should drop over the page from under the header and fold back up.

The menu is a strip of slats hinged edge to edge and folded in a zig-zag, flat under the header. Opening, the top slat swings down first, and each slat below lets go only once the one above is nearly down, so the strip unfolds from the top like a concertina shutter. Every slat rides on the bottom edge of the one above it, in 3D, and lands with a small swing past hanging. Light comes from above: a slat tipped up toward you catches it, a slat tipped down and away goes dark, and the joint between two slats darkens with how sharply they are folded. Closing, the bottom slat folds up first, quick and without a bounce.

[Live demo](https://motion.rujilabs.com/patterns/panel-shutter-menu/) · [style.css](style.css) · [shutter.js](shutter.js)

## Use

```html
<link rel="stylesheet" href="panel-shutter-menu/style.css">
<script src="play.js"></script>
<script src="panel-shutter-menu/shutter.js" defer></script>

<button class="shutter-toggle" type="button" aria-expanded="false" aria-controls="nav">Menu</button>
<nav class="shutter" id="nav" aria-label="Shop">
  <ul class="shutter-list">
    <li class="shutter-slat"><a href="/paint">Paint and colour mixing</a></li>
    <li class="shutter-slat"><a href="/plumbing">Pipes and plumbing</a></li>
    <!-- one .shutter-slat per link -->
  </ul>
</nav>
```

Place the `nav` over the page yourself (the demo uses `position: absolute` under the header). The script sets the list's height to what the slats cover, so anything below it sits under the last slat.

## Options

| Property or hook | Does | Default |
|---|---|---|
| `--shutter-slat` on `.shutter` | Slat colour | Safety yellow `#f2b705` |
| `--shutter-ink` | Text on the slats | Near black |
| `--shutter-joint` | The line between two slats | Black at 28 percent |
| `--shutter-ring` | Focus ring on a link | Near black |
| `button.shutter.set(true)` | Opens or closes it from code | |
| `shutteropen`, `shutterclose` | Events on the `nav` | |

| Input | Does |
|---|---|
| Click or tap the button, Enter, Space | Opens or closes the menu |
| Tab | Through the links while it is open |
| Escape | Closes it and puts focus back on the button |

## Do

- Keep slats the same height. The zig-zag folds flat only when they match.
- Use four to seven slats. Fewer and there is no cascade to see; more and the last one waits too long.
- Dim the page behind the open menu so the strip reads as a layer.

## Do not

- Nest a submenu inside a slat. A slat is one link.
- Give a slat a transparent background. The fold relies on each slat hiding the one behind it.

## Reduced motion

The menu shows and hides at once, flat and evenly lit, with no cascade.

## See also

[`drawer`](../drawer/), a panel that slides in from the side, and [`blinds`](../blinds/), slats as a view transition.
