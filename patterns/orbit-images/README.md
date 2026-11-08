# Orbit images

Use when: a page has one main picture and a handful of parts that belong to it (a dish and its ingredients, a product and its add-ons), and you want the parts to circle it until someone picks one.

Small pictures ride a tilted ring around the main one in real CSS 3D, so the ones at the back pass behind it and dim a little. Tab to one, or tap it, and the ring turns the short way until that one is in front, where it grows and its name and note show. A Pause button stops the ring.

[Live demo](https://motion.rujilabs.com/patterns/orbit-images/) · [style.css](style.css) · [orbit-images.js](orbit-images.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="orbit-images/style.css">
<script src="orbit-images/orbit-images.js" defer></script>

<section>
  <div class="oi" role="group" aria-label="Ingredients" data-oi-start="18">
    <div class="oi-ring">
      <div class="oi-hub"><img src="bowl.svg" alt="A bowl of laksa Sarawak"></div>
      <button class="oi-item" type="button" data-oi-note="Peel them, and keep the heads for the stock.">
        <img src="prawns.svg" alt=""><span class="oi-name">Prawns, 300 g</span>
      </button>
      <!-- 4 to 9 items -->
    </div>
  </div>
  <p aria-live="polite" data-oi-caption data-oi-hint="Tab or tap an ingredient to bring it to the front."></p>
  <button class="oi-pause" type="button" aria-pressed="false" hidden>Pause</button>
</section>
```

Give `.oi` a height (the ring is absolutely placed inside it). The caption and pause button are found in the nearest `section`, `article` or `body` around the ring. Each item's `.oi-name` is its accessible name, so keep it in the button even if you only show it on the front item.

## Options

| Name | What it does | Default |
|---|---|---|
| `--oi-r` | Radius of the ring | `170px` |
| `--oi-tilt` | How far the ring leans back; 90deg would be edge on | `64deg` |
| `--oi-depth` | Perspective of the scene; smaller is more dramatic | `900px` |
| `data-oi-period` | One full turn, in ms | `32000` |
| `data-oi-start` | Angle of the ring before it starts | `0` |

The whole ring turns on one registered custom property, `--oi-a`, animated with the Web Animations API; every item reads it to stay upright and facing you. Browsers without `@property` show the ring still, and picking an item still jumps it to the front. The spin stops while the ring is off screen or the tab is hidden.

## Do

- Keep it slow, about half a minute a turn: it is a background idle, not a show.
- Put real text next to it (the caption) so the parts can be read without waiting for the ring.

## Do not

- Do not use more than about nine items: the back of the ring gets crowded behind the hub.
- Do not make the items the only way to reach what they name. They are a picture of a list, so keep the list too.

## Reduced motion

The ring stands still at its start angle and the Pause button stays hidden. Picking an item jumps it straight to the front and names it.
