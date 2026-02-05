# @siteimprove/alfa-toolchain

## 0.110.0

## 0.109.0

### Patch Changes

- **Changed:** Global dependency graph now only includes dependencies in the current workspaces, rather than by scope. ([#1953](https://github.com/Siteimprove/alfa/pull/1953))

  This allows to have several workspaces with the same scope without pulling everything out, typically the situation we have with many `alfa-integrations` packages depending on the main `alfa` packages.

- **Added:** `yarn generate-dependency-graph` can now generate only some of the graphs. ([#1953](https://github.com/Siteimprove/alfa/pull/1953))

  E.g.:
  - `yarn generate-dependency-graphs $(pwd) all` to generate all graphs.
  - `yarn generate-dependency-graphs $(pwd) global` to generate all only the global graph.
  - `yarn generate-dependency-graphs $(pwd) alfa-css` to generate only the graphs for packages containing `alfa-css` in their name.

## 0.108.2

## 0.108.1

## 0.108.0

## 0.107.0

### Minor Changes

- **Changed:** The `generate-packges-graphs` command has been replaced by a `generate-dependency-graphs` command which also generates a global dependency graph between workspaces of the repository. ([#1902](https://github.com/Siteimprove/alfa/pull/1902))

## 0.106.1

## 0.106.0

### Patch Changes

- **Changed:** Dependency graph generation is now more modular. ([#1893](https://github.com/Siteimprove/alfa/pull/1893))

  This makes it easier to reuse it for something else than the inter-files dependencies in a package.

## 0.105.0

### Minor Changes

- **Added:** A new functionality for gathering unit test coverage data. ([#1878](https://github.com/Siteimprove/alfa/pull/1878))

  The unit test coverage data of each individual package is gather and consolidated into a single file.

### Patch Changes

- **Added:** Test coverage data is now included in all packages, as well as at global level. ([#1878](https://github.com/Siteimprove/alfa/pull/1878))

## 0.104.1

## 0.104.0

## 0.103.3

## 0.103.2

## 0.103.1

## 0.103.0

## 0.102.0

## 0.101.0

## 0.100.1

## 0.100.0

## 0.99.0

## 0.98.0

### Minor Changes

- **Added:** A new utility to skaffold workspace creation with default settings is available. ([#1745](https://github.com/Siteimprove/alfa/pull/1745))

### Patch Changes

- **Changed:** Classes that do not implement the Singleton pattern now have `protected` constructor and can be extended. ([#1735](https://github.com/Siteimprove/alfa/pull/1735))

## 0.97.0

## 0.96.0

## 0.95.0

## 0.94.1

## 0.94.0

## 0.93.8

### Patch Changes

- **Changed:** Dummy release ([`5af377071ffabd497b2068ac60035937cb6a4a34`](https://github.com/Siteimprove/alfa/commit/5af377071ffabd497b2068ac60035937cb6a4a34))

## 0.93.7

## 0.93.6

### Patch Changes

- **Changed:** Dummy release ([`75d7ba7256ae82485b7b3aad03464cf9dc69bb40`](https://github.com/Siteimprove/alfa/commit/75d7ba7256ae82485b7b3aad03464cf9dc69bb40))

## 0.93.5

### Patch Changes

- **Changed:** Dummy release ([`6b9bdd9bffe2e628f8482ab640f96817feff7b39`](https://github.com/Siteimprove/alfa/commit/6b9bdd9bffe2e628f8482ab640f96817feff7b39))

## 0.93.4

### Patch Changes

- **Changed:** Dummy release ([`bc0ac853f75507654642b326e042a08601a2026c`](https://github.com/Siteimprove/alfa/commit/bc0ac853f75507654642b326e042a08601a2026c))

## 0.93.3

## 0.93.2

## 0.93.1

## 0.93.0

## 0.92.0

### Minor Changes

- **Changed:** Alfa packages are now (also) published on the npmjs registry. ([`5b924adf304b6f809f4c8b9d5a2f4a8950d5b10b`](https://github.com/Siteimprove/alfa/commit/5b924adf304b6f809f4c8b9d5a2f4a8950d5b10b))

## 0.91.2

### Patch Changes

- **Changed:** Fixing token injection ([`41bce73bcbcf39c8d2afd3d127e949f7143bbb99`](https://github.com/Siteimprove/alfa/commit/41bce73bcbcf39c8d2afd3d127e949f7143bbb99))

## 0.91.1

### Patch Changes

- **Changed:** Trying npmjs publish. ([#1680](https://github.com/Siteimprove/alfa/pull/1680))

## 0.91.0

### Minor Changes

- **Changed:** Dummy minor version to experiment with publish flow, use the previous or next minor version instead. ([`2a62d8a43e294ee56c18315c8fad29fbdc18c0df`](https://github.com/Siteimprove/alfa/commit/2a62d8a43e294ee56c18315c8fad29fbdc18c0df))

## 0.90.1

## 0.90.0

### Minor Changes

- **Changed:** Remove npmjs publication for now ([#1677](https://github.com/Siteimprove/alfa/pull/1677))

## 0.89.3

## 0.89.2

### Patch Changes

- **Changed:** Trying to fix a problem in generating provenance statements ([#1674](https://github.com/Siteimprove/alfa/pull/1674))

## 0.89.1

### Patch Changes

- **Added:** Trying to publish Alfa packages on the npm registry ([#1673](https://github.com/Siteimprove/alfa/pull/1673))

## 0.89.0

### Patch Changes

- **Fixed:** Mark callable scripts as executable. ([#1661](https://github.com/Siteimprove/alfa/pull/1661))

## 0.88.0

### Minor Changes

- **Fixed:** The publish flow was updated to a new version. ([`a2f19cf9a6c7c72b8bf085597e4f1a95ac3e4eb2`](https://github.com/Siteimprove/alfa/commit/a2f19cf9a6c7c72b8bf085597e4f1a95ac3e4eb2))

  Some 0.87.\* versions were generating uninstallable package. This should be fixed now.

## 0.87.12

### Patch Changes

- **Fixed:** Fixed location of artifacts. ([`15fbbd14a4c48239ce3fb5c6622ce9040603f517`](https://github.com/Siteimprove/alfa/commit/15fbbd14a4c48239ce3fb5c6622ce9040603f517))

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
