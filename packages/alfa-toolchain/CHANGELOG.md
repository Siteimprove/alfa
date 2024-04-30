# @siteimprove/alfa-toolchain

## 0.79.1

## 0.79.0

## 0.78.2

## 0.78.1

## 0.78.0

## 0.77.0

## 0.76.0

## 0.75.2

## 0.75.1

## 0.75.0

## 0.74.0

## 0.73.0

## 0.72.0

## 0.71.1

## 0.71.0

## 0.70.0

### Minor Changes

- **Added:** Structure validation can now optionally check that changeset contain no "major" bump. ([#1509](https://github.com/Siteimprove/alfa/pull/1509))

  The option can be turned on for pre-1.0.0 projects, and turned off when moving to 1.0.0.

## 0.69.0

## 0.68.0

## 0.67.0

### Minor Changes

- **Added:** Initial release of a package to handle the toolchain ([#1462](https://github.com/Siteimprove/alfa/pull/1462))

  This package currently handles changelog generation and several validations of the code structure:

  - Checking that API extractor config is defined on each workspace.
  - Checking that `package.json` match the expected structure.
  - Checking that `package.json`'s dependencies match `tsconfig.json`'s references.
