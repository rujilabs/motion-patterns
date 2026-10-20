# Wiggle

A quick rotation back and forth that dies away, to pull the eye to one small thing: a bell with news, a basket that just changed. It turns on a pivot, so a bell swings from its top and a basket rocks on its wheels.

[Live demo](https://motion.rujilabs.com/patterns/wiggle/) · [style.css](style.css)

## Use

Put the class on the icon, not on the button around it, so the hit area stays still.

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="wiggle/style.css">

<div class="wiggle-group">
  <button aria-label="Notifications, 3 new"><svg class="wiggle">…</svg></button>
  <label class="wiggle-pause"><input type="checkbox"> Pause</label>
</div>
```

## Variants

| Class or property | What it does |
|---|---|
| `.wiggle` | Wiggles for 700ms, rests, repeats every `--wiggle-every` (default `4s`), first after `--wiggle-delay` (`1s`) |
| `.wiggle-once` | One wiggle on load |
| `.wiggle-hover` | One wiggle each time the pointer arrives on it or its parent, or either takes keyboard focus |
| `.wiggle-pause` inside `.wiggle-group` | A checkbox that stops every looping wiggle in the group |
| `--wiggle-origin` | The pivot. Default `50% 0` (hangs from the top). Things that stand: `50% 100%` |
| `--wiggle-a` | First swing, default `14deg`. The next swings are 80%, 55%, 35% and 15% of it |

## Do

- Wiggle one thing per screen, and only while it has news. Remove the class once the person has opened it.
- Keep the rest long. Four seconds between wiggles is about the shortest that does not nag.

## Do not

- Use it for an error. A rejected field shakes side to side: see [shake](../shake/).
- Wiggle text or a whole card. Rotation on a large box makes the corners swing a long way.

## Reduced motion

Every wiggle is off and the pause toggle hides. The red count beside the bell still says there is news.
