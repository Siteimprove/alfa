# @siteimprove/alfa-selector

## 0.111.0

## 0.110.0

## 0.109.0

## 0.108.2

## 0.108.1

### Patch Changes

- **Changed:** CSS lexing and parsing performance improvements. ([#1945](https://github.com/Siteimprove/alfa/pull/1945))

## 0.108.0

### Minor Changes

- **Breaking:** The key selector of compound selectors is now the last id/class/type in it instead of the first. ([#1937](https://github.com/Siteimprove/alfa/pull/1937))

  This improves cascade build time, where they are bucketed according to the key selectors, since the components in a compound are usually ordered from most generic to most precise, so this results in smaller buckets on average.

- **Added:** Relative selectors can now be anchored with `Relative#anchoredAt`. ([#1930](https://github.com/Siteimprove/alfa/pull/1930))

### Patch Changes

- **Changed:** Selectors who do not depend on context for matching are now matched with a more aggressive cache strategy. ([#1938](https://github.com/Siteimprove/alfa/pull/1938))

- **Added:** Selectors now have a `useContext` property telling whether the matching depends on context (`:focus`, `:hover`, …) or is purely structural (type or class selector, …) ([#1938](https://github.com/Siteimprove/alfa/pull/1938))

- **Fixed:** `:is` and `:where` now correctly parse their argument as a forgiving list. ([#1930](https://github.com/Siteimprove/alfa/pull/1930))

- **Fixed:** Anchored relative selectors are now correctly matched. ([#1930](https://github.com/Siteimprove/alfa/pull/1930))

- **Changed:** Selector matching for `:host` and `:host-context` is now cached, improving performances for pages using them a lot. ([#1937](https://github.com/Siteimprove/alfa/pull/1937))

- **Changed:** The non-pseudo- selectors of a compound selector are now matched right to left. ([#1937](https://github.com/Siteimprove/alfa/pull/1937))

  This improves performances under the assumption that the most precise selectors are usually written last, thus increasing the probability of an early mismatch.

- **Fixed:** `:has` pseudo-class is now correctly matched. ([#1930](https://github.com/Siteimprove/alfa/pull/1930))

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

## 0.102.0

## 0.101.0

## 0.100.1

## 0.100.0

## 0.99.0

## 0.98.0

### Patch Changes

- **Changed:** Classes that do not implement the Singleton pattern now have `protected` constructor and can be extended. ([#1735](https://github.com/Siteimprove/alfa/pull/1735))

## 0.97.0

## 0.96.0

## 0.95.0

## 0.94.1

## 0.94.0

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

- **Added:** The `:checked` pseudo-class is now supported. ([#1684](https://github.com/Siteimprove/alfa/pull/1684))

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

### Minor Changes

- **Added:** The `:any-link` pseudo-class is now supported. ([#1629](https://github.com/Siteimprove/alfa/pull/1629))

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

## 0.73.0

### Minor Changes

- **Added:** The `:host` and `:host-context` pseudo-classes, as well as the `::slotted` pseudo-element are now supported. ([#1554](https://github.com/Siteimprove/alfa/pull/1554))

## 0.72.0

### Minor Changes

- **Added:** `Specificity` is now exported for external use. ([#1540](https://github.com/Siteimprove/alfa/pull/1540))

## 0.71.1

## 0.71.0

### Minor Changes

- **Added:** Selectors now contain a "key selector" which is the leftmost simple selector in a compound one, or the rightmost in a complex one. ([#1534](https://github.com/Siteimprove/alfa/pull/1534))

## 0.70.0

### Minor Changes

- **Added:** The `:nth-child` and `:nth-last-child` pseudo-classes now accept the "of selector" syntax. ([#1524](https://github.com/Siteimprove/alfa/pull/1524))

- **Added:** `Selector` now contain their own `Specificity`. ([#1514](https://github.com/Siteimprove/alfa/pull/1514))

- **Breaking:** The type guards on selectors are now under the namespace of the same name. ([#1508](https://github.com/Siteimprove/alfa/pull/1508))

  That is, use `Compound.isCompound` instead of `Selector.isCompound`, …

- **Breaking:** `Compound` selectors are now built on top of Iterable, rather than re-inventing chained lists. ([#1508](https://github.com/Siteimprove/alfa/pull/1508))

  That is, `Compound#left` and `Compound#right` are no more available, but `Compound#selectors` replaces them.

- **Breaking:** The various kinds of selectors are now directly exported from the package, out of the `Selector` namespace. ([#1508](https://github.com/Siteimprove/alfa/pull/1508))

  That is, use `Id` instead of `Selector.Id`, … (or `import * as Selector` and keep using `Selector.Id`).

- **Added:** The `:where` pseudo-class is now handled. ([#1518](https://github.com/Siteimprove/alfa/pull/1518))

- **Breaking:** `List` selectors are now built on top of Iterable, rather than re-inventing chained lists. ([#1508](https://github.com/Siteimprove/alfa/pull/1508))

  That is, `List#left` and `List#right` are no more available, but `List#selectors` replaces them.

## 0.69.0

## 0.68.0

## 0.67.0

### Minor Changes

- **Added:** A function `isEmpty` to `Context` class ([#1464](https://github.com/Siteimprove/alfa/pull/1464))

## 0.66.0

## 0.65.1

## 0.65.0

## 0.64.0

## 0.63.3

## 0.63.2

## 0.63.1

## 0.63.0

## 0.62.2

## 0.62.1
