# Alfa actions

The workflows whose name start with `alfa-` are a collection of actions for Alfa operations, mostly geared toward building workflows that need to update content and push it to git.

## Assumptions

Most of these actions assume to a certain degree the structure of the repository to be close enough to the one of Alfa, namely:
* TypeScript (or ECMAScript) mono-repo, with yarn workspaces in `<prefix>/alfa-*`
* Default branch on `main`
* Relying on the `yarn install` / `yarn build` / `yarn test` cycle.
* Using node_modules for dependencies resolution.
* Using changeset for storing local changes as they happen.
* Sharing version number between all packages (`fixed` in changeset config).
* One CHANGELOG.md per workspace (this is part of changeset)
* One top-level CHANGELOG.md
* One `yarn alfa-changelog` command to update the top-level changelog.
* Packages published on the Github registry (may be public or restricted).
* A `scripts/coverage.sh` script to generate coverage reports.

These workflows are likely to fail on any repository that does not have the same structure. Use at your own judgement call.

## Warning

These actions are meant to push content to the main branch which may trigger other automated workflows (such as `integrate.yml`). Hence, they should always only be called from manual workflows (`workflow_dispatch`) to avoid infinite loops.

## Overview

* [`alfa-wrapper`.yml](alfa-wrapper.yml): a wrapper that can call any of the below actions. This is likely the one to use in your own workflows.

* [`alfa-setup.yml`](alfa-setup.yml): sets up the environment for Alfa operations: checkout, node, yarn, git, build essential packages. This is a prerequisite for all other actions.
* [`alfa-version.yml`](alfa-version.yml): creates a new version and update the changelogs.
* [`alfa-publish.yml`](alfa-publish.yml): publishes packages to the Github registry, and optionally to the NPM one.
* [`alfa-coverage.yml`](alfa-coverage.yml): updates the coverage reports.
* [`alfa-documentation.yml`](alfa-documentation.yml): updates the text documentation.

* [`alfa-release.yml`](./alfa-release.yml) (**DEPRECATED**): old monolithic action for releases.