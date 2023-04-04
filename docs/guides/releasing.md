# Releasing

Changesets takes care of the version bumping, according to [pre-registred changes](changeset.md).

The full release flow, including generating the global changelog, publishing the npm packages, and generating the Github release is handled by the [release workflow](../../.github/workflows/release.yml). See the called workflow for details.

The release workflow is triggered manually from the [Action tab](https://github.com/Siteimprove/alfa/actions/workflows/release.yml) in Github.
