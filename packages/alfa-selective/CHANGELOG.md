# @siteimprove/alfa-selective

## 0.79.0

## 0.78.2

## 0.78.1

## 0.78.0

## 0.77.0

## 0.76.0

## 0.75.2

## 0.75.1

## 0.75.0

### Minor Changes

- **Added:** A `#ifGuarded` method is now available. ([#1581](https://github.com/Siteimprove/alfa/pull/1581))

  This is useful for `Selective` that share part of the branch, to avoid re-doing potentially costly tests or building nested `Selective`. E.g., it can replace

  ```typescript
  Selective.of(x)
    .if(and(isFoo, isBar), fooBar)
    .if(isFoo /* and not(isBar) */, fooNotBar);
  ```

  with

  ```typescript
  Selective.of(x).ifGuarded(isFoo, isBar, fooBar, fooNotBar);
  ```

## 0.74.0

## 0.73.0

## 0.72.0

## 0.71.1

## 0.71.0

## 0.70.0

## 0.69.0

## 0.68.0

## 0.67.0

## 0.66.0

## 0.65.1

## 0.65.0

## 0.64.0

### Minor Changes

- **Added:** `Selective.if()` now accepts any refinement and will refine to the intersection of its result and the value in the associated right side. ([#1432](https://github.com/Siteimprove/alfa/pull/1432))

  This allows use cases like `Selective.of<A | B>(foo).if(isBOrC, bar => …)` to correctly refine `bar` to a `B` instead of defaulting to the `Predicate` overload that wouldn't refine anything.

## 0.63.3

## 0.63.2

## 0.63.1

## 0.63.0

## 0.62.2

## 0.62.1
