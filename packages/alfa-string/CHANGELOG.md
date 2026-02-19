# @siteimprove/alfa-string

## 0.111.0

## 0.110.0

## 0.109.0

## 0.108.2

## 0.108.1

## 0.108.0

## 0.107.0

## 0.106.1

## 0.106.0

## 0.105.0

### Patch Changes

- **Added:** Test coverage data is now included in all packages, as well as at global level. ([#1878](https://github.com/Siteimprove/alfa/pull/1878))

## 0.104.1

## 0.104.0

## 0.103.3

## 0.103.2

## 0.103.1

## 0.103.0

### Minor Changes

- **Added:** A `String.hasHyphenationOpportunity` predicate has been added, detecting U+00AD SOFT HYPHEN. ([#1784](https://github.com/Siteimprove/alfa/pull/1784))

### Patch Changes

- **Fixed:** `String.hasSoftWrapOpportunity` is now more strict in what it accepts. ([#1784](https://github.com/Siteimprove/alfa/pull/1784))
  - Non-breaking spaces are not considered soft wrap opportunities anymore.
  - Punctuation other than always visible hyphens (U+002D - HYPHEN-MINUS and U+2010 ‐ HYPHEN) are not considered soft wrap opportunities anymore.

## 0.102.0

## 0.101.0

## 0.100.1

## 0.100.0

## 0.99.0

## 0.98.0

### Minor Changes

- **Added:** A new `String.fallback` transformer combinator is available, to replace whitespace only strings with a fallback value. ([#1745](https://github.com/Siteimprove/alfa/pull/1745))

- **Breaking:** `String.and` has been renamed `String.Transformer.and`. ([#1745](https://github.com/Siteimprove/alfa/pull/1745))

- **Added:** A new `String.Transformer.when` combinator is available, to conditionally apply a transformer based on a predicate. ([#1745](https://github.com/Siteimprove/alfa/pull/1745))

## 0.97.0

## 0.96.0

## 0.95.0

## 0.94.1

## 0.94.0

### Minor Changes

- **Added:** A `String.and` combinator for chaining transformers is now available. ([#1712](https://github.com/Siteimprove/alfa/pull/1712))

- **Added:** A `String.removePunctuation` transformer is now available. ([#1712](https://github.com/Siteimprove/alfa/pull/1712))

- **Added:** A `String.hasSoftWrapOpportunity` predicate is now available. ([#1710](https://github.com/Siteimprove/alfa/pull/1710))

- **Added:** A `String.Transformer` type alias is now available. ([#1712](https://github.com/Siteimprove/alfa/pull/1712))

### Patch Changes

- **Added:** The function `String.toLowerCase` was added. ([#1707](https://github.com/Siteimprove/alfa/pull/1707))

  It just calls the built in `.toLowerCase` function but returns `Lowercase<string>`.

## 0.93.8

## 0.93.7

## 0.93.6

## 0.93.5

## 0.93.4

## 0.93.3

## 0.93.2

## 0.93.1

## 0.93.0

### Minor Changes

- **Added:** A `String.hasWhitespace` predicate is now available. ([#1694](https://github.com/Siteimprove/alfa/pull/1694))

## 0.92.0

### Minor Changes

- **Changed:** Alfa packages are now (also) published on the npmjs registry. ([`5b924adf304b6f809f4c8b9d5a2f4a8950d5b10b`](https://github.com/Siteimprove/alfa/commit/5b924adf304b6f809f4c8b9d5a2f4a8950d5b10b))

## 0.91.2

## 0.91.1

## 0.91.0

### Minor Changes

- **Changed:** Dummy minor version to experiment with publish flow, use the previous or next minor version instead. ([`2a62d8a43e294ee56c18315c8fad29fbdc18c0df`](https://github.com/Siteimprove/alfa/commit/2a62d8a43e294ee56c18315c8fad29fbdc18c0df))

## 0.90.1

## 0.90.0

## 0.89.3

## 0.89.2

### Patch Changes

- **Changed:** Trying to fix a problem in generating provenance statements ([#1674](https://github.com/Siteimprove/alfa/pull/1674))

## 0.89.1

### Patch Changes

- **Added:** Trying to publish Alfa packages on the npm registry ([#1673](https://github.com/Siteimprove/alfa/pull/1673))

## 0.89.0

## 0.88.0

### Minor Changes

- **Fixed:** The publish flow was updated to a new version. ([`a2f19cf9a6c7c72b8bf085597e4f1a95ac3e4eb2`](https://github.com/Siteimprove/alfa/commit/a2f19cf9a6c7c72b8bf085597e4f1a95ac3e4eb2))

  Some 0.87.\* versions were generating uninstallable package. This should be fixed now.

## 0.87.12

## 0.87.11

## 0.87.10

## 0.87.7

## 0.87.6

## 0.87.5

## 0.87.4

## 0.87.3

## 0.87.2

## 0.87.1

## 0.87.0

## 0.86.2

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

### Minor Changes

- **Added:** Package `@siteimprove/alfa-string` grouping low-level string manipulations is now available. ([#1572](https://github.com/Siteimprove/alfa/pull/1572))
