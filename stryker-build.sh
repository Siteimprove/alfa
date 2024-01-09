#!/bin/sh

set -xe

tsc --build --clean
yarn install
tsc --build --verbose