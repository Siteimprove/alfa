# @siteimprove/alfa-rules

## 0.68.0

## 0.67.0

### Minor Changes

- **Breaking:** SIA-R6 is now deprecated, following ACT rules changes. ([#1461](https://github.com/Siteimprove/alfa/pull/1461))

  The rule is still available as `Deprecated.DR6` for a while.

- **Changed:** Color contrast rules, currently SIA-R66 and SIA-R69, can now tell which interposed elements can be ignored if layout is available. ([#1464](https://github.com/Siteimprove/alfa/pull/1464))

  If layout is not available the rules keep the current behavior of asking a `ignored-interposed-elements` question.

### Patch Changes

- **Changed:** SIA-R54 now ignores targets with no element descendant. ([#1465](https://github.com/Siteimprove/alfa/pull/1465))

## 0.66.0

### Patch Changes

- **Fixed:** SIA-R19 correctly searches for `id` in the full DOM tree again (instead of the subtree of the element). ([#1459](https://github.com/Siteimprove/alfa/pull/1459))

## 0.65.1

### Patch Changes

- **Fixed:** Issue where R75 would incorrectly flag some elements with invisible text ([#1456](https://github.com/Siteimprove/alfa/pull/1456))

  This was due to a change in the applicability of the rule which exposed some elements to being misidentified as having insufficient font size, even though they in fact had invisible text.
  Other elements are in some cases also now passing where they would previously not be flagged by the rule, but this is not considered a bug.

## 0.65.0

### Minor Changes

- **Changed:** SIA-R83 now has improved detection of containers large enough to not clip content. ([#1451](https://github.com/Siteimprove/alfa/pull/1451))

  When the potential clipping ancestor is at least twice as big (in the correct axis) as the potentially clipped content, Alfa now assumes that the content won't be clipped at 200%. This can only happen when layout boxes are provided for the audit.

- **Removed:** Many pieces of code are no longer exported. These were mostly internal exports that are no longer used in other files and should not impact intended usage of the packages. ([#1437](https://github.com/Siteimprove/alfa/pull/1437))

- **Removed:** The `@siteimprove/alfa-rules/FlattenedRules` export is no longer available. ([#1437](https://github.com/Siteimprove/alfa/pull/1437))

  This was duplicating similar exports of the package.

  Replace `import { FlattenedRules } from "@siteimprove/alfa-rules"` with `import FlattenedRules from "@siteimprove/alfa-rules"`.

### Patch Changes

- **Changed:** SIA-R13 is now inapplicable to `<iframe>` elements that are marked as decorative, following latest ACT rules changes. ([#1445](https://github.com/Siteimprove/alfa/pull/1445))

- **Added:** All rules now have an explicit `Stability` tag. ([#1437](https://github.com/Siteimprove/alfa/pull/1437))

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
