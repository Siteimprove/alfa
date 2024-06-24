# @siteimprove/alfa-aria

## 0.83.1

## 0.83.0

## 0.82.0

### Minor Changes

- **Breaking:** Node 18 is no longer supported. ([#1618](https://github.com/Siteimprove/alfa/pull/1618))

## 0.81.0

### Patch Changes

- **Added:** Each package now contains its internal dependency graph in its `docs` directory. ([#1610](https://github.com/Siteimprove/alfa/pull/1610))

- **Fixed:** Accessible name computation has been optimized ([#1611](https://github.com/Siteimprove/alfa/pull/1611))

## 0.80.0

### Minor Changes

- **Changed:** `Node.toJSON` now serialises the corresponding DOM node as its path in the **flat tree**, not in the DOM tree. ([#1607](https://github.com/Siteimprove/alfa/pull/1607))

### Patch Changes

- **Changed:** Role computation for `<li>` elements now looks for a parent `<ul>` in the flat tree, not the DOM tree. ([#1607](https://github.com/Siteimprove/alfa/pull/1607))

  Browsers seem to behave differently on that case, but allowing slotted `<li>` makes sense, so taking this interpretation for now.

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

- **Breaking:** `Name.Source` and `Name.State` are now exported from the top-level of the package. ([#1566](https://github.com/Siteimprove/alfa/pull/1566))

### Patch Changes

- **Fixed:** Alfa now correctly handle spaces in accessible names. ([#1566](https://github.com/Siteimprove/alfa/pull/1566))

  - `<br>` elements add a space to the name.
  - Text nodes with leading or trailing spaces (including space only nodes) keep the space when concatenated.
  - Names of descendants with an `aria-label` are spaced, following browsers' behavior.
  - Names of descendants displayed as `table-cell` are spaced, following browsers' behavior.

## 0.72.0

## 0.71.1

## 0.71.0

## 0.70.0

## 0.69.0

### Patch Changes

- **Fixed:** The `<hgroup>` element now has an implicit role of `group`. ([#1506](https://github.com/Siteimprove/alfa/pull/1506))

  Following the re-introduction of `<hgroup>`, and subsequent changes to the HTML AAM.

## 0.68.0

## 0.67.0

### Patch Changes

- **Fixed:** Name from content now correctly includes shadow DOM. ([#1470](https://github.com/Siteimprove/alfa/pull/1470))

  When the accessible name is computed from the descendants, slots and descendants inside a shadow DOM are correctly taken into account. This mimic what browsers are doing, and what the accessible name conputation group seems to be moving toward.

## 0.66.0

## 0.65.1

## 0.65.0

### Minor Changes

- **Removed:** Many pieces of code are no longer exported. These were mostly internal exports that are no longer used in other files and should not impact intended usage of the packages. ([#1437](https://github.com/Siteimprove/alfa/pull/1437))

## 0.64.0

## 0.63.3

## 0.63.2

## 0.63.1

## 0.63.0

## 0.62.2

## 0.62.1
