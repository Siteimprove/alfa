# @siteimprove/alfa-selective

## 0.64.0

### Minor Changes

- **Added:** `Selective.if()` now accepts any refinement and will refine to the intersection of its result and the value in the associated right side. ([#1432](https://github.com/Siteimprove/alfa/pull/1432))

  This allows use cases like `Selective.of<A | B>(foo).if(isBOrC, bar => …)` to correctly refine `bar` to a `B` instead of defaulting to the `Predicate` overload that wouldn't refine anything.

## 0.63.3

### Patch Changes

- Updated dependencies []:
  - @siteimprove/alfa-applicative@0.63.3
  - @siteimprove/alfa-either@0.63.3
  - @siteimprove/alfa-equatable@0.63.3
  - @siteimprove/alfa-functor@0.63.3
  - @siteimprove/alfa-hash@0.63.3
  - @siteimprove/alfa-json@0.63.3
  - @siteimprove/alfa-mapper@0.63.3
  - @siteimprove/alfa-monad@0.63.3
  - @siteimprove/alfa-predicate@0.63.3
  - @siteimprove/alfa-refinement@0.63.3

## 0.63.2

### Patch Changes

- Updated dependencies []:
  - @siteimprove/alfa-applicative@0.63.2
  - @siteimprove/alfa-either@0.63.2
  - @siteimprove/alfa-equatable@0.63.2
  - @siteimprove/alfa-functor@0.63.2
  - @siteimprove/alfa-hash@0.63.2
  - @siteimprove/alfa-json@0.63.2
  - @siteimprove/alfa-mapper@0.63.2
  - @siteimprove/alfa-monad@0.63.2
  - @siteimprove/alfa-predicate@0.63.2
  - @siteimprove/alfa-refinement@0.63.2

## 0.63.1

### Patch Changes

- Updated dependencies []:
  - @siteimprove/alfa-applicative@0.63.1
  - @siteimprove/alfa-either@0.63.1
  - @siteimprove/alfa-equatable@0.63.1
  - @siteimprove/alfa-functor@0.63.1
  - @siteimprove/alfa-hash@0.63.1
  - @siteimprove/alfa-json@0.63.1
  - @siteimprove/alfa-mapper@0.63.1
  - @siteimprove/alfa-monad@0.63.1
  - @siteimprove/alfa-predicate@0.63.1
  - @siteimprove/alfa-refinement@0.63.1

## 0.63.0

### Patch Changes

- Updated dependencies []:
  - @siteimprove/alfa-either@0.63.0
  - @siteimprove/alfa-applicative@0.63.0
  - @siteimprove/alfa-equatable@0.63.0
  - @siteimprove/alfa-functor@0.63.0
  - @siteimprove/alfa-hash@0.63.0
  - @siteimprove/alfa-json@0.63.0
  - @siteimprove/alfa-mapper@0.63.0
  - @siteimprove/alfa-monad@0.63.0
  - @siteimprove/alfa-predicate@0.63.0
  - @siteimprove/alfa-refinement@0.63.0

## 0.62.2

### Patch Changes

- Updated dependencies []:
  - @siteimprove/alfa-applicative@0.62.2
  - @siteimprove/alfa-either@0.62.2
  - @siteimprove/alfa-equatable@0.62.2
  - @siteimprove/alfa-functor@0.62.2
  - @siteimprove/alfa-hash@0.62.2
  - @siteimprove/alfa-json@0.62.2
  - @siteimprove/alfa-mapper@0.62.2
  - @siteimprove/alfa-monad@0.62.2
  - @siteimprove/alfa-predicate@0.62.2
  - @siteimprove/alfa-refinement@0.62.2

## 0.62.1

### Patch Changes

- Updated dependencies []:
  - @siteimprove/alfa-applicative@0.62.1
  - @siteimprove/alfa-either@0.62.1
  - @siteimprove/alfa-equatable@0.62.1
  - @siteimprove/alfa-functor@0.62.1
  - @siteimprove/alfa-hash@0.62.1
  - @siteimprove/alfa-json@0.62.1
  - @siteimprove/alfa-mapper@0.62.1
  - @siteimprove/alfa-monad@0.62.1
  - @siteimprove/alfa-predicate@0.62.1
  - @siteimprove/alfa-refinement@0.62.1
