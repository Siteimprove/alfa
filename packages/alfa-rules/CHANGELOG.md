# @siteimprove/alfa-rules

## 0.76.0

### Minor Changes

- **Added:** New rule SIA-R113 for testing minimum target size and spacing of clickable elements. ([#1589](https://github.com/Siteimprove/alfa/pull/1589))

## 0.75.2

## 0.75.1

### Patch Changes

- **Fixed:** New diagnostic `WithBoundingBox` is now exported ([#1584](https://github.com/Siteimprove/alfa/pull/1584))

## 0.75.0

### Minor Changes

- **Added:** Extended diagnostic `WithBoundingBox` for reporting bounding box is now available. ([#1579](https://github.com/Siteimprove/alfa/pull/1579))

- **Added:** User agent controlled expectation to R111. ([#1579](https://github.com/Siteimprove/alfa/pull/1579))

  The rule should pass targets that are user agent controlled like `input type="checkbox"` where the size has not been modified. As a first approximation we let it pass all `input` elements, but this is subject to change.

## 0.74.0

### Patch Changes

- **Fixed:** A regression on R1 for `<title>` with whitespace but not empty content has been fixed (was introduced in v0.73.0). ([#1573](https://github.com/Siteimprove/alfa/pull/1573))

## 0.73.0

### Minor Changes

- **Added:** New rule SIA-R111 for testing target size of clickable elements. ([#1564](https://github.com/Siteimprove/alfa/pull/1564))

- **Changed:** R69 is no longer applicable to text that only contains punctuation. ([#1551](https://github.com/Siteimprove/alfa/pull/1551))

## 0.72.0

### Patch Changes

- **Fixed:** SIA-R18 now accepts attributes for `input type=file` and `input type=color` according to the [ARIA in HTML](https://w3c.github.io/html-aria/#el-input-file) specification ([#1541](https://github.com/Siteimprove/alfa/pull/1541))

## 0.71.1

### Patch Changes

- **Changed:** Media rules R23 and R29 no longer asks if audio is playing or where the play buttons is when the attributes `autoplay` and `controls` are present respectively. ([#1538](https://github.com/Siteimprove/alfa/pull/1538))

## 0.71.0

### Minor Changes

- **Breaking:** Diagnostic `WithAccessibleName` has been renamed to `WithName` and the property `accessibleName` to `name`. ([#1537](https://github.com/Siteimprove/alfa/pull/1537))

  This is to conform to existing diagnostics that refer to accessible name as name and clients that are expecting this convention.

## 0.70.0

### Minor Changes

- **Fixed:** Accessible name is now also recorded as in #1502 in can't tell outcomes for rules R15, R39, R41 and R81 ([#1529](https://github.com/Siteimprove/alfa/pull/1529))

### Patch Changes

- **Fixed:** SIA-R10 now correctly accepts the `one-time-code` token. ([#1517](https://github.com/Siteimprove/alfa/pull/1517))

## 0.69.0

### Minor Changes

- **Added:** Accessible name is now recorded in the diagnostics for R15, R39, R41 and R81 ([#1502](https://github.com/Siteimprove/alfa/pull/1502))

- **Added:** Role is now recorded in the diagnostic for R8 ([#1504](https://github.com/Siteimprove/alfa/pull/1504))

- **Breaking:** Diagnostics `WithPreviousHeading` and `WithNextHeading` have been replaced by `WithOtherHeading`. ([#1505](https://github.com/Siteimprove/alfa/pull/1505))

- **Breaking:** Question `visible-focus-classes`, and question type `string[]` have been removed. ([#1497](https://github.com/Siteimprove/alfa/pull/1497))

### Patch Changes

- **Fixed:** SIA-R70 now accepts `<hgroup>`. ([#1506](https://github.com/Siteimprove/alfa/pull/1506))

  The element has been re-introduced in the HTML standard, with improved content model.

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
