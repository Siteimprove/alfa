# @siteimprove/alfa-selector

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
