# Change sets

This project uses [changesets](https://github.com/changesets/changesets) to track changes when they occur (together with the Pull request), and gather them at release time. Changesets also takes care of tracking the required increments and bumping all packages together.

To create a changeset, simply run:

```shell
$ yarn changeset
```

and follow the flow, see more instructions at [Adding a changeset](https://github.com/changesets/changesets/blob/main/docs/adding-a-changeset.md).

Remember:

- As long as Alfa is in version 0.*, no **major** bump should be recorded. Anything that would normally require a major bump instead uses a minor bump.
- Always prefer using the full editor (i.e. submit empty changeset on the CLI to trigger the editor). This lets you enter both a title (first line) and details for the change.
- The changelog entry is already tied with the Git PR. No need to add it. Focus on what concise info is needed for consumers to adapt their code or understand a different behaviour.
- Not all changes require change sets. A change set is only needed with changes of public API (call signatures), or behaviour (bug fixes); a changeset is not needed for update to documentation, refactoring, …
- A single PR may add several change sets. Sometimes, it makes sense to touch several bits in one PR, and each may require a specific change set. Each changeset will generate a separate Changelog entry; so when it makes sense to have two changelog entries, then it makes sense to have two changesets.
- A single change set may affect several packages. Sometimes even an atomic change is touching things in a few places; then it makes sense to have a single changeset to group them.

When a changeset is created, a new file is added to `.changeset/unique-id.md`; this file needs to be added to git and committed! The changeset is then part of the PR and can be reviewed in context.

PRs without changeset will get a warning by the changeset bot. This is not blocking the PR since not all changes require change sets… 
