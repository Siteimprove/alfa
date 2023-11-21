# @siteimprove/alfa-dom

## 0.68.0

### Minor Changes

- **Breaking:** `Element#of` now requires the device used when scraping a page in order to store a box. ([#1474](https://github.com/Siteimprove/alfa/pull/1474))

  This ensures that the boxes of the elements will be stored with and only be accessible for the same device instance. If no device is provided, no box is stored with the element.

- **Added:** `Document#toJSON` now optionally accepts serialization options containing device. ([#1474](https://github.com/Siteimprove/alfa/pull/1474))

  The options will be passed down to all children of the document and used by `Element` to serialize the box corresponding to the device.

## 0.67.0

## 0.66.0

## 0.65.1

## 0.65.0

### Minor Changes

- **Added:** Support for optional `box` everywhere when constructing an `Element`. ([#1440](https://github.com/Siteimprove/alfa/pull/1440))

  Boxes are expected to be the result of `getBoundingClientRect`, i.e. contain adding and border.

  It is up to the caller to ensure that the boxes were generated on the same `Device` that is used for audits. Alfa does not (and cannot) verify this.

  Alfa assumes that the boxes where generated with an empty `Context`. It is up to the caller to ensure that this is the case.

- **Removed:** Many pieces of code are no longer exported. These were mostly internal exports that are no longer used in other files and should not impact intended usage of the packages. ([#1437](https://github.com/Siteimprove/alfa/pull/1437))

- **Breaking:** Renamed public property `rectangle` to `box` which was overlooked in the last version ([#1440](https://github.com/Siteimprove/alfa/pull/1440))

- **Added:** A `Element.hasBox` predicate builder is now available. ([#1450](https://github.com/Siteimprove/alfa/pull/1450))

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
