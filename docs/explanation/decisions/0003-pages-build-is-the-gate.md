# 0003 The Pages build is the gate

- Status: accepted
- Date: 2026-10-13

## Context

The site needs a check that runs on every change, for free, without a separate CI service to maintain.

## Decision

Cloudflare Pages builds the site from `main` with `npm run build`, and that command runs the full gate first. A failing gate fails the build, and Pages keeps the previous version live. Pull requests get a preview build with the same gate.

## Consequences

- One command is both the local check and the deploy check.
- No CI workflow to keep in sync.
- Build logs live in Cloudflare, not on the pull request page; contributors run `npm run check` locally before pushing.
