# Lens flare

A bright light inside the frame throws a row of soft discs and rings through the frame centre. As the light moves, the whole row swings with it, the way reflections between lens elements do.

[Live demo](https://motion.rujilabs.com/patterns/lens-flare/) · [style.css](style.css)

## Use

Put a `.flare` layer over your picture. Each disc says where it sits on the line from the light through the centre with `--k`.

```html
<section class="flare-group">
  <label class="flare-pause"><input type="checkbox"> Pause</label>
  <div class="frame flare-move">
    <img src="hills-at-dusk.jpg" alt="Hills at dusk">
    <div class="flare" aria-hidden="true">
      <span class="flare-disc flare-source"></span>
      <span class="flare-disc ghost-1"></span>
      <span class="flare-disc flare-ring ghost-2"></span>
    </div>
  </div>
</section>
```

```css
.frame { position: relative; container-type: inline-size; }
.flare-source { --k: 1; --fs: 44cqw; --fo: .95; }
.ghost-1 { --k: -.4; --fs: 10cqw; --fo: .2; }
.ghost-2 { --k: -1; --fs: 16cqw; --fo: .35; --flare-delay: .3s; }
```

## Options

| Class or property | What it does |
|---|---|
| `--flare-x`, `--flare-y` | Where the light is, 0 to 100 (percent of the frame). Set them, animate them, or set them from script on pointer move |
| `.flare-move` | On the frame: the light crosses in an arc and back. 12s one way (`--flare-dur`) |
| `.flare-disc` | One disc on the row. `--k` place (1 on the light, 0 the centre, negative past it), `--fs` size, `--fc` colour, `--fo` strength |
| `.flare-ring` | A hollow ring instead of a filled disc |
| `.flare-source` | The light itself: a hot core in a wide glow. Use `--k: 1` |
| `.flare-streak` | A thin horizontal streak through the light. Use `--k: 1` |
| `--flare-delay` | When a disc fades in on load |
| `.flare-follow` | On any element (like a drawn sun) centred in the frame: moves it to the light |
| `.flare-pause` inside `.flare-group` | A checkbox that pauses everything in the group |

## Do

- Keep the discs faint, mostly under 50% strength, with one or two colours. Real flare is a hint, not a light show.
- Let the light leave the frame now and then. A flare that is always there stops reading as light.

## Do not

- Cover a face or text with the row. Plan the light's path so the centre line misses the subject.
- Use it in a scene with no visible light source.

## Reduced motion

The flare shows at once with the light held near the top left, and nothing moves. The pause toggle hides.

## Browser support

The smooth swing needs `@property`. Without it the light jumps between the keyframes instead of gliding.
