# Security policy

The collection is static CSS, SVG and a small script, so the attack surface is small. Things worth reporting:

- An entry that loads an external resource or runs script in a way the gate missed
- A way to get script into the gallery page (for example through `meta.json` text)
- A weakness in the site's headers or Content Security Policy

## Report

Use a [private security advisory](https://github.com/rujilabs/motion-patterns/security/advisories/new). Please do not open a public issue. Expect a first reply within 7 days.

## Supported versions

Only the latest release and `main` get fixes.
