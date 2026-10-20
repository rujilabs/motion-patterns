# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/). This file is generated from commit
messages by `npm run changelog`; do not edit it by hand.

## [0.3.0] - 2026-10-20

### Added

- **site:** Live timelines under every demo, entry pages, curve plots
- **patterns:** New demo for every pattern, pulse dot thump
- **templates:** Rework paper diorama, squeeze headline and stamp collage
- **split-flap-board:** Add ferry departures board template
- **patterns:** Add chart and state patterns
- **site:** Transition, camera and look categories
- **patterns:** Add entrance, polish and transition patterns
- **patterns:** Add camera move and shot style patterns
- **patterns:** Add choosing and switching control patterns
- **patterns:** Add film cut and wipe transition patterns
- **patterns:** Add overlay patterns: modal, drawer, sheet, menus, toast
- **patterns:** Add hover and click interaction patterns
- **patterns:** Add loading, page transition and ambient patterns
- **patterns:** Add photo lighting looks
- **patterns:** Add navigation, status and scroll patterns
- **patterns:** Add tone and finishing looks
- **patterns:** Add lens and camera looks
- **patterns:** Add animation principle patterns
- **patterns:** Add text and shape patterns
- **patterns:** Add 3D, paper and break-apart transitions
- **site:** One motion-<category>.css per category, filters in category order

### Fixed

- **site:** Scale tall pattern demos to fit their stage
- **cube:** Keep the faces off the caption in a short frame; fix(line-boil): side by side in a short frame

### Performance

- **split-flap-board:** Build the moving flaps only while a cell turns
- **paper-diorama-hero:** Promote layers only while the pointer moves them
- **site:** Smooth scrolling on the gallery
- **site:** Unload gallery demos far off screen


## [0.2.0] - 2026-10-13

### Added

- **rise:** In-view and soft variants, early opacity, capped stagger, entry readme
- **fade:** Frame without flash or layout shift, settle and in-view variants, entry readme
- **draw:** Stroke sequence, text and hover underlines, no cap dot before start, entry readme
- **pop:** Damped spring easing, early opacity, in-view, corner origin and button press, entry readme
- **stamp:** Impact timing with squash and settle, ink seal variant, in-view, entry readme
- **marquee:** Pause toggle, edge fades, reverse rows and speed setting, readable reduced-motion fallback, entry readme
- **pulse:** Beat-and-rest halo sized in em, sonar and counted variants, still halo under reduced motion, entry readme
- **drift:** Three-cycle float that composes with transforms, phase and size controls, entry readme
- **crossfade:** 2 to 4 frames, slow zoom option, pause toggle, all captions readable, entry readme
- **reveal:** Eased scroll rise, clip, parallax and progress bar, timed fallback via play.js, entry readme
- **paper:** Pop-up fold for upright pieces, fading back card, after-build slot and quick pace, entry readme
- **stretch-squeeze:** Hover without layout shift, light-to-heavy variant, font preload, entry readme
- **paper-diorama-hero:** Stacked layout on phones, pop-up house and trees, birds and tag after the build, readme
- **squeeze-headline:** Sequenced entry after the headline settles, button press and arrow, band pause toggle, readme
- **stamp-collage:** Sold out ink seal, spring lift on hover, decoration behind the cards, price labels for screen readers, readme

### Fixed

- **gallery:** Show a credit line only on credited entries


## [0.1.0] - 2026-10-13

### Added

- Motion patterns collection with 12 patterns, 3 templates and gallery

### Fixed

- Review findings across the gate, patterns, templates and gallery


