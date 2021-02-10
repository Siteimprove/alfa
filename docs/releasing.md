# Releasing

Alfa is managed using [Lerna](https://lerna.js.org/) which handles the process of versioning packages and committing version tags to [git](https://git-scm.com/). When a new release is to ready to be published, do:

```console
$ yarn lerna version
```

This will prompt you for the type of increment to perform (major, minor, or patch) and update the version of all packages that have changed since the last published version. Once a new version tag has been committed and pushed, the release workflow defined in [`.github/workflows/release.yml`](../.github/workflows/release.yml) kicks off and takes care of publishing updated packages and pushing a new release to GitHub.
