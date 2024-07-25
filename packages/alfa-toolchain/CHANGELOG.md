# @siteimprove/alfa-toolchain

## 0.87.11

### Patch Changes

- **Changed:** Fixed some typo in the publication workflow ([`a40c6844fc18c2a4be56d9f0c59bca844254af55`](https://github.com/Siteimprove/alfa/commit/a40c6844fc18c2a4be56d9f0c59bca844254af55))

## 0.87.10

### Patch Changes

- **Changed:** Trying another publish flow. Again. ([`3f71ede37c32121013a1268b476e290048152ccd`](https://github.com/Siteimprove/alfa/commit/3f71ede37c32121013a1268b476e290048152ccd))

## 0.87.7

### Patch Changes

- **Changed:** Ignore - Debug. ([`363e5ae4ac00a4511ad06ff09d453141efb061c0`](https://github.com/Siteimprove/alfa/commit/363e5ae4ac00a4511ad06ff09d453141efb061c0))

## 0.87.6

### Patch Changes

- **Changed:** Ignore - testing. ([`274d5c0f8afbc0d26ce3199985e14fbf72a400c7`](https://github.com/Siteimprove/alfa/commit/274d5c0f8afbc0d26ce3199985e14fbf72a400c7))

## 0.87.5

### Patch Changes

- **Changed:** Fixed the final publish command. ([`c5dfe5e322dc0df659a0864fa8c35a4002eb599e`](https://github.com/Siteimprove/alfa/commit/c5dfe5e322dc0df659a0864fa8c35a4002eb599e))

## 0.87.4

### Patch Changes

- **Changed:** Trying a different publication process, adding provenance statements. ([#1659](https://github.com/Siteimprove/alfa/pull/1659))

## 0.87.3

## 0.87.2

### Patch Changes

- **Changed:** Reverted changes to publish process ([#1654](https://github.com/Siteimprove/alfa/pull/1654))

## 0.87.1

### Patch Changes

- **Changed:** Trying a new release flow ([#1653](https://github.com/Siteimprove/alfa/pull/1653))

## 0.87.0

## 0.86.2

### Patch Changes

- **Fixed:** The `changelog` export is now correctly exported. ([#1645](https://github.com/Siteimprove/alfa/pull/1645))

## 0.86.1

## 0.86.0

### Minor Changes

- **Breaking:** TS resolution has been changed to `Node16`, target to `es2022`. ([#1636](https://github.com/Siteimprove/alfa/pull/1636))

- **Breaking:** Alfa is now distributed as ESM rather than CJS modules; projects using it must be ESM or use dynamic `import()`. ([#1636](https://github.com/Siteimprove/alfa/pull/1636))

  ⚠️ This is the last of a series of changes on the internal structure and build process of distributed packages that was started with v0.85.0.

## 0.85.1

## 0.85.0

### Minor Changes

- **Breaking:** The .js files are now built in the `dist` folder rather than in `src`. ([#1628](https://github.com/Siteimprove/alfa/pull/1628))

  ⚠️ This is the first of a series of changes on the internal structure and build process of distributed packages. It is probably better to not use this version and wait until more of these internal changes have been done to jump directly to the final result. We are internally releasing these changes for validation purpose only.

  This should not impact consumers, the `package.json` files should be set correctly to consume these files.

## 0.84.0

## 0.83.1

## 0.83.0

## 0.82.0

### Minor Changes

- **Breaking:** Node 18 is no longer supported. ([#1618](https://github.com/Siteimprove/alfa/pull/1618))

## 0.81.0

### Minor Changes

- **Added:** A new `yarn generate-graphs` command for package specific dependency graph. ([#1610](https://github.com/Siteimprove/alfa/pull/1610))

  The dependency graph of each package is stored in its own directory.

### Patch Changes

- **Added:** Each package now contains its internal dependency graph in its `docs` directory. ([#1610](https://github.com/Siteimprove/alfa/pull/1610))

## 0.80.0

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
