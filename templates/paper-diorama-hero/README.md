# Paper diorama hero

A full-width hero where a cut-paper landscape builds behind the headline: hills slide up, the house and trees pop up, then birds drift in and a "rooms left" tag appears. The headline and button are readable from the first frame.

[Live demo](https://motion.rujilabs.com/templates/paper-diorama-hero/) · [index.html](index.html) · [style.css](style.css)

Built from the [paper](../../patterns/paper/) and [drift](../../patterns/drift/) patterns. Copy CSS in the gallery gives one file with tokens, both patterns and this template.

## Layout

| Width | Layout |
|---|---|
| Under 900px and portrait | Copy on the sky colour, then the scene as a 4:3 band below it. The build starts when the band scrolls into view |
| 900px and up, or any landscape frame | The scene fills the hero; the copy sits on the left over the sky |

## Make it yours

- **Palette:** the fills are plain hex values in `index.html`. Keep 3 to 4 tints per colour, lighter for the far layers, and one darkest ink for the shadow (`flood-color` in `#pd-shadow`).
- **Scene:** keep the subject (here the house) and small extras like the birds in the right half of the 1200 x 700 view box, so the copy never covers it on wide screens and the 4:3 crop keeps it on phones.
- **Order:** `data-layer` 0 (back card) to 8 (foreground). If you add layers, raise `--paper-layers` on `.hero` to the new highest number.
- **Pop-ups:** add `fold` to any upright piece (signs, trees, buildings).

## Reduced motion

The scene, birds and tag all show complete at once.
