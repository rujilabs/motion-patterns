# Contributing

Thanks for adding to the collection. This page covers the ways to help and the rules a pull request has to meet.

## Ways to help

| You have | Do this |
|---|---|
| A link to a motion you like | [Suggest a motion](https://github.com/rujilabs/motion-patterns/issues/new?template=suggest-a-motion.yml) |
| Time to build it | Open a pull request with a new entry folder |
| A bug in an entry | [Report a bug](https://github.com/rujilabs/motion-patterns/issues/new?template=bug.yml) |
| Your work here without credit | [Credit or removal request](https://github.com/rujilabs/motion-patterns/issues/new?template=credit-or-removal.yml) |

## A new entry, start to finish

1. Fork, then `npm run dev` to see the gallery locally.
2. Follow [add an entry](docs/how-to/add-an-entry.md). New to this? Do the [tutorial](docs/tutorials/01-your-first-pattern.md) first.
3. Decide `relation` with [credit a source](docs/how-to/credit-a-source.md).
4. Write the entry's `README.md` (the gate requires one; copy the shape from [`rise`](patterns/rise/README.md)).
5. `npm run catalogue && npm run check` must pass.
6. Open the pull request and fill in the template.

> [!IMPORTANT]
> No code, image, font or text from a source without a licence that allows it. Rebuild the movement from scratch and credit the source.

## Commit messages

[Conventional Commits](https://www.conventionalcommits.org/). They drive the version and the changelog.

| Prefix | For |
|---|---|
| `feat(<slug>):` | A new entry or a new option on one |
| `fix(<slug>):` | A bug in an entry |
| `docs:` | Docs only |
| `chore:` / `ci:` / `test:` | Everything else |

Example: `feat(card-shuffle): add card shuffle recreation`.

## Style

- Plain words in docs and comments. No en or em dashes (the gate checks).
- CSS comments say what the pattern is for and any trap, not what each line does.
- Demo pages: neutral copy, fictional names, no real brands or logos.

## Code of conduct

Everyone here follows the [Code of Conduct](CODE_OF_CONDUCT.md).
