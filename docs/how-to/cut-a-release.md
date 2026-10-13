# Cut a release

Versions follow [semver](https://semver.org/) and are derived from [Conventional Commits](https://www.conventionalcommits.org/). [git-cliff](https://git-cliff.org/) writes the changelog.

| Commits since the last tag | Bump |
|---|---|
| any `fix:` | patch `0.1.x` |
| any `feat:` | minor `0.x.0` |
| `feat!:` or `BREAKING CHANGE:` | major |
| only `docs`, `chore`, `test`, `ci`, `style` | none |

Renaming or removing a class, a token or a `meta.json` field is breaking.

## Steps

```bash
npm i -g git-cliff                          # once
git cliff --bumped-version                  # suggested next version, e.g. v0.2.0
git cliff --tag v0.2.0 -o CHANGELOG.md      # regenerate the changelog
npm version 0.2.0 --no-git-tag-version      # bump package.json
# update the version badge in README.md
git add CHANGELOG.md package.json README.md
git commit -m "chore(release): v0.2.0"
git tag -a v0.2.0 -m "v0.2.0"
git push origin main --follow-tags
```

Publish the GitHub Release from the changelog section, not from generated notes:

```bash
awk -v v="## [0.2.0]" 'index($0, v) == 1 { f = 1; next } f && /^## \[/ { exit } f { print }' CHANGELOG.md > /tmp/notes.md
gh release create v0.2.0 --title "v0.2.0" --notes-file /tmp/notes.md --verify-tag
```

> [!CAUTION]
> `git cliff -o CHANGELOG.md` rewrites the whole file. If someone hand-wrote an `[Unreleased]` section, promote it by hand instead.

> [!NOTE]
> A tag does not deploy. The site deploys on every push to `main`; the version number shown in the gallery comes from `package.json`.
