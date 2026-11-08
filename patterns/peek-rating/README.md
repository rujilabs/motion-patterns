# Peek rating

Use when: someone rates something they just had out of five, such as a delivered meal.

Five real radios drawn as stars, with a small drawn face that peeks over a ledge above them. Before anyone rates, only the top of its head and its eyes show. Come near, hover or Tab in and it rises to watch. As the stars fill, its mood follows: one star and the brows pull down into a frown, three and it shrugs flat, five and the eyes squint shut, the cheeks blush and the mouth opens in a grin. Hovering a star previews the face; leaving goes back to the value. A pick pops that star and the face gives a small hop. The mood moves on a spring, so each new face overshoots a touch, the way a real reaction does.

[Live demo](https://motion.rujilabs.com/patterns/peek-rating/) · [style.css](style.css) · [peek-rating.js](peek-rating.js)

## Use

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="peek-rating/style.css">
<script src="peek-rating/peek-rating.js" defer></script>

<fieldset class="peek-rating">
  <legend>Rate the meal</legend>
  <span class="pr-face" aria-hidden="true">
    <svg class="pr-head" viewBox="0 0 88 72">
      <circle class="pr-skin" cx="44" cy="44" r="26"/>
      <ellipse class="pr-cheek" cx="27" cy="50" rx="5" ry="3.5"/>
      <ellipse class="pr-cheek" cx="61" cy="50" rx="5" ry="3.5"/>
      <path class="pr-brow" d="M29 29.5 37.5 30.5"/>
      <path class="pr-brow" d="M50.5 30.5 59 29.5"/>
      <ellipse class="pr-eye" cx="35" cy="38" rx="3.2" ry="4.3"/>
      <ellipse class="pr-eye" cx="53" cy="38" rx="3.2" ry="4.3"/>
      <path class="pr-open" d="M37 55Q44 56.1 51 55Z" opacity="0"/>
      <path class="pr-mouth" d="M37 55Q44 56.1 51 55"/>
    </svg>
  </span>
  <div class="pr-stars">
    <label class="pr-star"><input type="radio" name="stars" value="1" aria-label="1 star"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9z"/></svg></label>
    <!-- the same for 2 to 5 -->
  </div>
</fieldset>
```

Each star is a label around a real radio, so arrow keys, Tab and screen readers work, and the form submits the value. The script sets `data-show` on the group (the star under the pointer, or else the value) and the CSS turns that into one number, `--pr-mood`. The mouth is the one part drawn by the script, a curve worked out from `--pr-mood` each frame while the spring runs.

## Options

Set these on `.peek-rating`.

| Property | Does | Default |
|---|---|---|
| `--pr-star` | Lit star colour | `#f2b01e` |
| `--pr-off` | Unlit star outline | `#c9cfd8` |
| `--pr-skin`, `--pr-ink` | Face fill and line colour | Warm yellow, dark brown |
| `--pr-blush` | Cheek colour at 4 and 5 stars | `#ff8a7a` |
| `--pr-ring` | Focus ring colour | `#3d7bf2` |

The mood for each star is one line each (`.peek-rating[data-show="3"] { --pr-mood: .05; }`). Change them to make the face kinder or harsher.

## Do

- Give each radio a label in words ("2 stars, could be better") and say the result in a status line.
- Draw the ledge yourself (the demo uses a bottom border on `.pr-face`), so the peek reads as hiding behind something.

## Do not

- Use a face for ratings of people, such as a driver or a doctor. A frowning face aimed at a person reads as mockery.
- Make one star look angry enough to scare people off rating low. Honest low ratings are the useful ones.

## Reduced motion

The face rises and changes straight to the new mood, with no spring, no star pop and no hop. Without the script the stars still fill from `:has()` and the face waits at the ledge.

## See also

[`heart-burst`](../heart-burst/), a save button with a burst.
