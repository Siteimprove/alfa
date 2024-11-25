# Change sets

This project uses [changesets](https://github.com/changesets/changesets) to track changes when they occur (together with the Pull request), and gather them at release time. Changesets also takes care of tracking the required increments and bumping all packages together.

To create a changeset, simply run:

```shell
$ yarn changeset
```

and follow the flow, see more instructions at [Adding a changeset](https://github.com/changesets/changesets/blob/main/docs/adding-a-changeset.md).

## Guidelines

- Alfa follows [Semantic Versioning](https://semver.org/). Use the appropriate bump type for the changeset.
- As long as Alfa is in version 0.*, no **major** bump should be recorded. Anything that would normally require a major bump instead uses a minor bump.
- Always prefer using the full editor (i.e. submit empty changeset on the CLI to trigger the editor). This lets you enter both a title (first line) and details for the change.
- The changelog entry is already tied with the Git PR. No need to add it. Focus on what concise info is needed for consumers to adapt their code or understand a different behaviour.
- On the other hand, changeset can contain short references to Github issues (`#1234`) that will be auto-linked in the changelogs.
- Not all changes require changesets. A changeset is only needed with changes of public API (call signatures), or behaviour (bug fixes); a changeset is not needed for update to documentation, refactoring, …
- A single PR may add several changesets. Sometimes, it makes sense to touch several bits in one PR, and each may require a specific changeset. Each changeset will generate a separate Changelog entry; so when it makes sense to have two changelog entries, then it makes sense to have two changesets. A single PR may even add several changesets at different bump levels.
- A single changeset may affect several packages. Sometimes even an atomic change is touching things in a few places; then it makes sense to have a single changeset to group them.

When a changeset is created, a new file is added to `.changeset/unique-id.md`; this file needs to be added to git and committed! The changeset is then part of the PR and can be reviewed in context. It may also be edited by a later PR if that makes sense.

PRs without changeset will get a warning by the changeset bot. This is not blocking the PR since not all changes require change sets… 

## Alfa changesets

Alfa changesets have the following shape:

```markdown
**[kind]:** [title]

[details]
```

Where `[kind]` is one of `Fixed`, `Changed`, `Added`, `Removed`, `Breaking`. As a  rule of thumb, `Breaking` and `Removed` kinds require a major bump (minor as long as we are in version 0.*); `Added` requires a minor bump; `Fixed` requires a patch bump; `Changed` may be minor or patch bump depending on the exact change, but should not be major (a change requiring a major bump is usually `Breaking`).

The `[title]` will be included in the [global changelog](../../CHANGELOG.md). It should be a one-liner short description of the change. Consider the information that a consumer would need to know in order to update the version of Alfa they use.

The `[details]` are only included in the individual changelog of the corresponding package(s). They are most often not needed. They can most notably contain migration instructions in case of breaking changes.

The overall structure, as well as the allowed `[kind]` are validated automatically. We currently do not have validation that the `[kind]` matches the bump type as it is a bit less clear cut.