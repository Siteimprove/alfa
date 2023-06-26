# @siteimprove/alfa-rules

## 0.64.0

### Minor Changes

- **Breaking:** Deprecated R34 and R36 ([#1428](https://github.com/Siteimprove/alfa/pull/1428))

  The rules have been renamed to DR34 and DR36 and removed from the composite rules R35, R37 and R38

### Patch Changes

- **Fixed:** SIA-R78 now correctly has a scope of "Page". ([#1434](https://github.com/Siteimprove/alfa/pull/1434))

## 0.63.3

### Patch Changes

- **Fixed:** a typo in `Diagnostic.Contrast` export was fixed. ([#1420](https://github.com/Siteimprove/alfa/pull/1420))

- **Added:** `Diagnostic.ElementDistsinguishable` is not exported. ([#1420](https://github.com/Siteimprove/alfa/pull/1420))

  **Added:** Correctly export `DistinguishingProperty` as `Diagnostic.ElementDistinguishable.Property`

## 0.63.2

### Patch Changes

- **Fixed:** Correctly exported the `ColorError` diagnostic. ([#1419](https://github.com/Siteimprove/alfa/pull/1419))

## 0.63.1

## 0.63.0

### Minor Changes

- **Changed:** Deprecated rules SIA-DR62, SIA-DR91, SIA-DR92, SIA-DR93 and SIA-DR95 have been removed ([#1415](https://github.com/Siteimprove/alfa/pull/1415))

  The version 1 of these rules, which was deprecated, has now been entirely removed.

- **Added:** Diagnostic subclasses have been added to the public API ([#1400](https://github.com/Siteimprove/alfa/pull/1400))

  The subclasses of the `Diagnostic` class are now part of the public API.
  Example of usage:

  ```
  import { Diagnostic } from "@siteimprove/alfa-rules";

  function foo(d: Diagnostic.Languages) {
    // ...
  }
  ```

- **Breaking:** Deprecate SIA-R18, SIA-R66, and SIA-R69 version 1 ([#1415](https://github.com/Siteimprove/alfa/pull/1415))

  The versions 1 of these rules have been deprecated. The versions 2, previously experimental, are now the stable ones.
  The versions 1 are still usable as `Rules.Deprecated.DR18`, … They will be removed in a later release.

### Patch Changes

- **Changed:** `isAriaControlsRequired` has been renamed to `isAriaControlsOptional` ([#1394](https://github.com/Siteimprove/alfa/pull/1394))

  This matches the actual behavior of the function.

- **Added:** A `withDocumentElement` helper is now available. ([#1407](https://github.com/Siteimprove/alfa/pull/1407))

  Added an Applicability helper to return the document when it has a document element (`<html>`) child.

## 0.62.2

## 0.62.1
