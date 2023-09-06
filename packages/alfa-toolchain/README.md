# Alfa toolchain

This package contains the toolchain for developing Alfa and its [companion projects](../../docs/guides/README.md#alfa-structure). It is tailored-made for Alfa and makes many (poorly documented) assumptions on code structure that likely do not hold on other codebases. Therefore, it is unlikely to be re-usable by other projects.

## Changelog

Alfa is using [changesets](../../docs/guides/changeset.md). We keep one changelog per package, plus one global changelog (because we keep all packages in sync at the same version number). The per package changelogs are handled directly by changeset, using a custom generation function defined here. The global changelog is built with utilities here.

Individual changesets are expected to have the following shape (after the frontmatter):

```markdown
**[kind]:** [title]

[details]
```

where `[title]` is a one line summary for the changes (the full text is called `summary` in changesets lingo, so we call that summary `title` instead), `[details]` is an arbitrary long detailed explanation, and `[kind]` is one of: `Breaking`, `Removed`, `Added`, `ChangeDd`, Fixed`.

`Breaking` and `Removed` kinds may only be used on major bumps (or minor bumps pre-1.0.0); `Added` kind may only be used on minor or major bumps (and should only be used on minor bumps); `Changed` and `Fixed` kinds can be used on any bump but should only be used on patch bumps.

The individual changelog contains the full changeset. The global changelog contains only the title, with link to the individual changelog.

## Validation

The package provides a bunch of low-level validation structure of the project. These checks can be toggled via [`./config/validate-structure.json`](config/validate-structure.json).

- Check that each changeset matches the structure described above.
- Check that each workspace has an API extractor config.
- Check that each workspace's `package.json` matches the expected structure.
- Check that each (internal) `dependencies` has its path referenced in the corresponding `tsconfig.json`.
