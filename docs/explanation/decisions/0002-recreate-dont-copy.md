# 0002 Recreate, do not copy

- Status: accepted
- Date: 2026-10-13

## Context

The collection gathers motions seen elsewhere: social posts, videos, pens, sites. Most of those have no licence, which means all rights are reserved. Copying their code or assets into an MIT repository would relicense work we do not own.

## Decision

Every entry declares a `relation`. Code is copied only as a `port`, and only from a source under a licence on an allowlist (MIT, CC0, Apache 2.0, BSD, ISC, Unlicense), keeping its notice. Everything else is a `recreation` or `inspired-by` entry, written from scratch, with the source credited by link. The gate enforces the allowlist and the credit fields.

## Consequences

- The repository can stay MIT without carrying someone else's rights.
- Creators get a visible credit and a removal path (the credit or removal form).
- Recreations take longer than copying.
- The gate cannot prove a recreation copied nothing; review has to.
