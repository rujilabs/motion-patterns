# Pulse

A soft halo that beats behind a status dot: once, then a rest, like a heartbeat.

[Live demo](https://motion.rujilabs.com/patterns/pulse/) · [style.css](style.css)

## Use

```html
<p class="status"><span class="pulse" aria-hidden="true"></span> Live now</p>
```

The dot takes `currentColor`, so set `color` on it (or its parent) for the status colour. It is sized in `em` and follows the text size.

## Variants

| Class or property | What it does | Use for |
|---|---|---|
| `.pulse` | One halo, 2s cycle, beats forever | Something live right now |
| `.pulse-double` | Adds a second halo half a beat behind | The single most important live thing on a page |
| `.pulse-count` | Beats 3 times, then rests | "New", "updated", "needs review": states that are not live |
| `--pulse-count` | Any number of beats | Tune `.pulse-count` |

## Do

- Always put the status in words next to the dot. Colour and motion alone do not tell everyone what it means.
- Keep the dot `aria-hidden="true"`; the words carry the meaning.

## Do not

- Pulse buttons or links to get clicks. It reads as an alarm and trains people to ignore it.
- Run more than one infinite pulse per screen.

## Reduced motion

The halo stops and stays as a faint still ring, so the dot still reads as a status rather than a bullet.
