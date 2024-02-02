#!/usr/bin/env sh

set -xe

sed -i /package-dependency-graph/d package.json
yarn install
tsc --build config/tsconfig.stryker.json
