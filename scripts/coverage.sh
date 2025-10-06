#!/usr/bin/env bash

set -euxo pipefail

# Generate global coverage reports
yarn coverage

# Generate package-specific coverage reports

# Since the command fails on packages that don't even have a `test` folder,
# we disable failing on error temporarily.
set +e

for package in packages/alfa-*; do
  yarn coverage:package ${package}
done

set -e
