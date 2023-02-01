# Releasing

> :warning: Make sure to stash all local changes, including untracked files, before running any of the commands below: `git stash --include-untracked`

Alfa uses the currently experimental [Yarn release workflow](https://yarnpkg.com/features/release-workflow) to manage releases. While this release workflow is geared towards individually versioned packages, we instead keep all package versions synchronised. The first step towards a release is therefore to mark all public packages for increment:

```console
$ yarn workspaces foreach \
    --no-private \
    --topological-dev \
    version --deferred <patch | minor | major>
```

When finished, inspect the file created at `.yarn/versions/<hash>.yml` to verify that all packages have been marked with the chosen increment. Once verified, apply the increment:

```console
$ yarn version apply --all
```

With the increment applied and the lockfile updated, edit the [changelog](../CHANGELOG.md).

Then, commit the changes, create a new release tag, and push:

```console
$ git commit --message <version> --all
$ git tag --message <version> --annotate <version>
$ git push --follow-tags
```

Once the release tag has been pushed, the release workflow defined in [`.github/workflows/release.yml`](../.github/workflows/release.yml) kicks off and takes care of publishing the packages and pushing a new release to GitHub.
