#!/usr/bin/env bash

set -euxo pipefail

# Generate global coverage reports
yarn coverage

# Generate package-specific coverage reports
for package in packages/alfa-*; do
  yarn coverage:package ${package}
done
