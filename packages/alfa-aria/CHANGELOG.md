# @siteimprove/alfa-aria

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
