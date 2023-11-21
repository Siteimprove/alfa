# @siteimprove/alfa-selective

## 1.0.0

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
