# Flowing menu row

Full-width menu rows that answer the pointer with a band of colour. It floods in from the edge the pointer came in by, carrying a running marquee of the row's words and small pictures, and drains out by the edge the pointer leaves by, so moving down a list feels like pouring through it.

[Live demo](https://motion.rujilabs.com/patterns/flowing-menu-row/) · [style.css](style.css) · [flowing-menu-row.js](flowing-menu-row.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="flowing-menu-row/style.css">
<script src="flowing-menu-row/flowing-menu-row.js" defer></script>

<nav><ul>
  <li>
    <a class="fm-row" href="/fiction">Fiction
      <span class="fm-band" aria-hidden="true">
        <span class="fm-track">
          <span class="fm-seq"><span>Fiction</span><img src="cover.jpg" alt=""><span>1,284 titles</span></span>
          <span class="fm-seq"><span>Fiction</span><img src="cover.jpg" alt=""><span>1,284 titles</span></span>
        </span>
      </span>
    </a>
  </li>
</ul></nav>
```

The band is decoration, so it is `aria-hidden`; the link's own text is its name. Write the sequence twice: the track loops by moving half its width.

## Options

| Property | Does | Default |
|---|---|---|
| `--fm-bg` | Band colour | `#1e2229` |
| `--fm-ink` | Band text colour | `#fff` |
| `--fm-dur` | Time for one loop of the marquee | `16s` |

| Input | Does |
|---|---|
| Pointer in by the top or bottom half | The band comes from that edge |
| Pointer out | The band leaves by the edge the pointer crossed |
| Tab to a row | The band comes from the top; it leaves when focus moves on |

The marquee only runs while the band is in, so it stops whenever the pointer or focus leaves.

## Do

- Give every row the same height, so the band's speed matches from row to row.
- Keep pictures small and few, about one per phrase. The row is still a link, not a gallery.

## Do not

- Put a second link or a button inside the row.
- Use it on touch-first lists. A tap floods the row and follows the link at once, so nobody sees it.

## Reduced motion

The band appears and goes at once, with no slide, and the words in it stand still.
