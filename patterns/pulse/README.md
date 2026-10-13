# Pulse

A soft halo that beats behind a status dot: once, then a rest, like a heartbeat. The dot itself gives a small thump (scale 1.2) as each halo leaves it, so the beat has a source.

[Live demo](https://motion.rujilabs.com/patterns/pulse/) · [style.css](style.css)

## Use

```html
<p class="status"><span class="pulse" aria-hidden="true"></span> Live now</p>
```

The dot takes `currentColor`, so set `color` on it (or its parent) for the status colour. It is sized in `em` and follows the text size.

## Variants

| Class or property | What it does | Use for |
|---|---|---|
| `.pulse` | One halo and a dot thump, 2s cycle, beats forever | Something live right now |
| `.pulse-double` | Adds a second halo half a beat behind | The single most important live thing on a page |
| `.pulse-count` | Beats 3 times, then rests | "New", "updated", "needs review": states that are not live |
| `--pulse-count` | Any number of beats | Tune `.pulse-count` |

## Do

- The thump uses the `scale` property, so it adds to any `transform` already on the dot.

- Always put the status in words next to the dot. Colour and motion alone do not tell everyone what it means.
- Keep the dot `aria-hidden="true"`; the words carry the meaning.

## Do not

- Pulse buttons or links to get clicks. It reads as an alarm and trains people to ignore it.
- Run more than one infinite pulse per screen.

## Reduced motion

The halo and the thump stop; the halo stays as a faint still ring, so the dot still reads as a status rather than a bullet.
