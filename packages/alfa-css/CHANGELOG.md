# @siteimprove/alfa-css

## 0.63.1

### Patch Changes

- Updated dependencies []:
  - @siteimprove/alfa-array@0.63.1
  - @siteimprove/alfa-comparable@0.63.1
  - @siteimprove/alfa-equatable@0.63.1
  - @siteimprove/alfa-hash@0.63.1
  - @siteimprove/alfa-iterable@0.63.1
  - @siteimprove/alfa-json@0.63.1
  - @siteimprove/alfa-mapper@0.63.1
  - @siteimprove/alfa-math@0.63.1
  - @siteimprove/alfa-option@0.63.1
  - @siteimprove/alfa-parser@0.63.1
  - @siteimprove/alfa-predicate@0.63.1
  - @siteimprove/alfa-record@0.63.1
  - @siteimprove/alfa-refinement@0.63.1
  - @siteimprove/alfa-result@0.63.1
  - @siteimprove/alfa-selective@0.63.1
  - @siteimprove/alfa-slice@0.63.1

## 0.63.0

### Minor Changes

- **Breaking:** `Linear.parse` and `Radial.parse` now require an item parser. ([#1412](https://github.com/Siteimprove/alfa/pull/1412))

  Both gradient parsing functions where using `Gradient.parseItemList`, which created a circular dependency between the files. The circle has been broken by injecting the item list parser in the individual parser. To migrate, simply call `Linear.parse(Gradient.parseItemList)` instead of `Linear.parse` (same with `Radial`).

- **Breaking:** `Math.resolve` now returns a `Result<Numeric, string>` instead of an `Option`. ([#1406](https://github.com/Siteimprove/alfa/pull/1406))

  Invalid expressions return an error message.

  **Breaking:** No resolver is needed for `Math.resolve` on `Number` expressions.

- **Removed:** `Math.parseLengthNumberPercentage` is no longer available. ([#1406](https://github.com/Siteimprove/alfa/pull/1406))

  Instead, a combination of `parseLengthPercentage` and `parseNumber` should be used.

### Patch Changes

- Updated dependencies [[`abc7b9744`](https://github.com/Siteimprove/alfa/commit/abc7b9744985d9935a079e82fddfa668463442c0), [`af412a630`](https://github.com/Siteimprove/alfa/commit/af412a6309e7eb1e8590d3f5e269bd95ac7d6f50)]:
  - @siteimprove/alfa-option@0.63.0
  - @siteimprove/alfa-result@0.63.0
  - @siteimprove/alfa-array@0.63.0
  - @siteimprove/alfa-iterable@0.63.0
  - @siteimprove/alfa-parser@0.63.0
  - @siteimprove/alfa-record@0.63.0
  - @siteimprove/alfa-slice@0.63.0
  - @siteimprove/alfa-comparable@0.63.0
  - @siteimprove/alfa-equatable@0.63.0
  - @siteimprove/alfa-hash@0.63.0
  - @siteimprove/alfa-json@0.63.0
  - @siteimprove/alfa-mapper@0.63.0
  - @siteimprove/alfa-math@0.63.0
  - @siteimprove/alfa-predicate@0.63.0
  - @siteimprove/alfa-refinement@0.63.0
  - @siteimprove/alfa-selective@0.63.0

## 0.62.2

### Patch Changes

- Updated dependencies []:
  - @siteimprove/alfa-array@0.62.2
  - @siteimprove/alfa-comparable@0.62.2
  - @siteimprove/alfa-equatable@0.62.2
  - @siteimprove/alfa-hash@0.62.2
  - @siteimprove/alfa-iterable@0.62.2
  - @siteimprove/alfa-json@0.62.2
  - @siteimprove/alfa-mapper@0.62.2
  - @siteimprove/alfa-math@0.62.2
  - @siteimprove/alfa-option@0.62.2
  - @siteimprove/alfa-parser@0.62.2
  - @siteimprove/alfa-predicate@0.62.2
  - @siteimprove/alfa-record@0.62.2
  - @siteimprove/alfa-refinement@0.62.2
  - @siteimprove/alfa-result@0.62.2
  - @siteimprove/alfa-selective@0.62.2
  - @siteimprove/alfa-slice@0.62.2

## 0.62.1

### Patch Changes

- Updated dependencies []:
  - @siteimprove/alfa-array@0.62.1
  - @siteimprove/alfa-comparable@0.62.1
  - @siteimprove/alfa-equatable@0.62.1
  - @siteimprove/alfa-hash@0.62.1
  - @siteimprove/alfa-iterable@0.62.1
  - @siteimprove/alfa-json@0.62.1
  - @siteimprove/alfa-mapper@0.62.1
  - @siteimprove/alfa-math@0.62.1
  - @siteimprove/alfa-option@0.62.1
  - @siteimprove/alfa-parser@0.62.1
  - @siteimprove/alfa-predicate@0.62.1
  - @siteimprove/alfa-record@0.62.1
  - @siteimprove/alfa-refinement@0.62.1
  - @siteimprove/alfa-result@0.62.1
  - @siteimprove/alfa-selective@0.62.1
  - @siteimprove/alfa-slice@0.62.1
