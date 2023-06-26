# @siteimprove/alfa-dom

## 0.64.0

### Minor Changes

- **Added:** Optional `Rectangle` property on `Element`. ([#1427](https://github.com/Siteimprove/alfa/pull/1427))

  The new property can optionally be set when constructing an element, but it doesn't do anything yet.

- **Breaking:** The method `.elementDescendants()` on the classes `Document` and `Node` has been removed. In stead the function `Query.getElementDescendants()` should be used. ([#1425](https://github.com/Siteimprove/alfa/pull/1425))

- **Added:** `Query` namespace with functions for querying element descendants and elements by id. ([#1413](https://github.com/Siteimprove/alfa/pull/1413))

  The result of the queries are cached.

## 0.63.3

## 0.63.2

## 0.63.1

## 0.63.0

### Minor Changes

- **Breaking:** `hasUniqueId` is now directly a `Predicate` ([#1408](https://github.com/Siteimprove/alfa/pull/1408))

  It used to a be `() => Predicate`, the useless void parameter has now been removed. To migrate, simply replace any call to `hasUniqueId()` by `hasUniqueId` (remove the useless empty parameter).

- **Added:** `hasTabIndex` now also accepts number values ([#1409](https://github.com/Siteimprove/alfa/pull/1409))

  `hasTabIndex` accepts numbers and will be satisfied if the tabindex is any of these numbers. It still alternatively accepts a `Predicate<number>`.

## 0.62.2

## 0.62.1
