# Folder open

Use when: a client, case or project is shown as a file, and opening it should lay out the few documents inside it at a glance.

A document folder with its front cover on a bottom hinge. Opening, the cover drops forward and the papers rise out and fan, each one a beat after the last, landing with a slight overshoot like paper with some spring in it. Closing runs it backwards: the papers sink last one first, then the cover shuts over them. The cover is the button, with `aria-expanded`; a click anywhere on the folder works too.

[Live demo](https://motion.rujilabs.com/patterns/folder-open/) · [style.css](style.css) · [folder-open.js](folder-open.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="folder-open/style.css">
<script src="play.js"></script>
<script src="folder-open/folder-open.js" defer></script>

<div class="folder">
  <div class="folder-back" aria-hidden="true"></div>
  <ul class="folder-papers" id="file-0417">
    <li class="folder-paper">Form B, YA 2025 ...</li>
    <li class="folder-paper">Profit and loss ...</li>
    <li class="folder-paper">Receipts log ...</li>
  </ul>
  <button class="folder-front" type="button" aria-expanded="true" aria-controls="file-0417">
    Kedai Runcit Pak Mat, YA 2025
  </button>
</div>
```

Give `.folder` a width; its height follows (10 by 7). Without the script the folder shows open, so every paper can be read.

## Options

| Property or attribute | Does | Default |
|---|---|---|
| `--folder-c` | Back and tab colour | `#e3b866` |
| `--folder-front` | Front cover colour | `#ecc77b` |
| `--folder-spread` | Angle between fanned papers | `8deg` |
| `data-open` on `.folder` | Starts open | Closed |

| Input | Does |
|---|---|
| Click or tap anywhere on the folder | Opens or closes it |
| Tab to the cover, Enter or Space | Opens or closes it |

Each `.folder` fires `folderopen` or `folderclose` (they bubble).

## Do

- Keep it to 2 to 4 papers, each showing one or two numbers that matter. More papers fan into a pile.
- Put the client's name on the cover, so the closed folder still says whose it is.

## Do not

- Put links or buttons on the papers. A click on the folder closes it.
- Use it for a long list of documents. That is a table.

## Reduced motion

The folder opens and shuts at once, with the papers already fanned.
