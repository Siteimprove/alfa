# @siteimprove/alfa-rules

## 0.111.0

## 0.110.0

### Minor Changes

- **Breaking:** Color composition (`Color.composite`) has been moved from `@siteimprove/alfa-rules` to `@siteimprove/alfa-css`. ([#1982](https://github.com/Siteimprove/alfa/pull/1982))

- **Changed:** Deprecated rules SIA-DR18, SIA-DR66, SIA-DR69 have been removed ([#1982](https://github.com/Siteimprove/alfa/pull/1982))

  The version 1 of these rules, which was deprecated, has now been entirely removed.

### Patch Changes

- **Fixed:** The "unresolvable colors" diagnostics for SIA-R66 and SIA-R69 have been removed, as colors are now always resolved (interposed descendants and images can style cause `cantTell` results). ([#1982](https://github.com/Siteimprove/alfa/pull/1982))

- **Added:** The `inert` attribute is now supported. ([#1964](https://github.com/Siteimprove/alfa/pull/1964))

## 0.109.0

### Patch Changes

- **Fixed:** R83 now more accurately computes line boxes for text nodes in clipping flex items in wrapping flex containers. ([#1960](https://github.com/Siteimprove/alfa/pull/1960))

## 0.108.2

## 0.108.1

### Patch Changes

- **Fixed:** SIA-R44 now correctly detects orientation conditional rotations in shadow DOM and iframes. ([#1939](https://github.com/Siteimprove/alfa/pull/1939))

- **Changed:** SIA-R44 is now more aggressive in detecting inapplicable pages when no orientation media rule controls a rotational property; resulting a much faster audits in these cases. ([#1939](https://github.com/Siteimprove/alfa/pull/1939))

## 0.108.0

## 0.107.0

## 0.106.1

## 0.106.0

### Minor Changes

- **Added:** New `@siteimprove/alfa-eaa` package added and corresponding `EAA` requirement references added to relevant rules. ([#1898](https://github.com/Siteimprove/alfa/pull/1898))

### Patch Changes

- **Changed:** SIA-R24 and SIA-R33 (and SIA-R35, SIA-R38) now pass on invisible but accessible transcripts. ([#1899](https://github.com/Siteimprove/alfa/pull/1899))

  This follows a clarification in WCAG and ACT rules.

## 0.105.0

### Patch Changes

- **Added:** Test coverage data is now included in all packages, as well as at global level. ([#1878](https://github.com/Siteimprove/alfa/pull/1878))

## 0.104.1

### Patch Changes

- **Fixed:** SIA-R117 now sends diagnostic data as part of its question. ([#1848](https://github.com/Siteimprove/alfa/pull/1848))

## 0.104.0

### Minor Changes

- **Added:** A new experimental rule SIA-R117: "Image accessible name is descriptive" is now available. ([#1845](https://github.com/Siteimprove/alfa/pull/1845))

## 0.103.3

## 0.103.2

## 0.103.1

## 0.103.0

### Patch Changes

- **Fixed:** SIA-R83 is now better at detecting soft wrap opportunities in text nodes. ([#1784](https://github.com/Siteimprove/alfa/pull/1784))

## 0.102.0

### Minor Changes

- **Fixed:** SIA-R111 and SIA-R113 now computes clickable regions more accurately when elements are clipped. ([#1761](https://github.com/Siteimprove/alfa/pull/1761))

### Patch Changes

- **Fixed:** SIA-R78 now ignores headings inside `<summary>` elements of closed `<details>`. ([#1782](https://github.com/Siteimprove/alfa/pull/1782))

  These headings are considered as being part of an accordion pattern.

## 0.101.0

### Patch Changes

- **Fixed:** SIA-R83 is now better at detecting small text within large clipping ancestors. ([#1775](https://github.com/Siteimprove/alfa/pull/1775))

  This will especially affect single word text in block containers, e.g. in a `<li>` element.

## 0.100.1

## 0.100.0

## 0.99.0

### Patch Changes

- **Fixed:** SIA-R115 now correctly also targets headings in nested documents and shadow DOM. ([#1766](https://github.com/Siteimprove/alfa/pull/1766))

## 0.98.0

### Patch Changes

- **Changed:** Classes that do not implement the Singleton pattern now have `protected` constructor and can be extended. ([#1735](https://github.com/Siteimprove/alfa/pull/1735))

## 0.97.0

### Patch Changes

- **Fixed:** URI of SIA-R115 is now correct. ([#1734](https://github.com/Siteimprove/alfa/pull/1734))

## 0.96.0

### Minor Changes

- **Added:** A new experimental rule SIA-R115: "Heading is descriptive" is now available. ([#1722](https://github.com/Siteimprove/alfa/pull/1722))

- **Added:** SIA-R116: "`<summary>` element has non-empty accessible name" is now available. ([#1728](https://github.com/Siteimprove/alfa/pull/1728))

- **Added:** Expose `allowedAttributes` on ARIA Element type. ([#1721](https://github.com/Siteimprove/alfa/pull/1721))

  This function takes into account "implicit ARIA semantics" and "ARIA role allowances" from [ARIA in HTML](https://w3c.github.io/html-aria/#docconformance). The logic is moved from rule R18 implementation.

## 0.95.0

## 0.94.1

### Patch Changes

- **Fixed:** SIA-R111 and SIA-R113 now ignores invisible descendants of interactive elements when computing the clickable areas. ([#1716](https://github.com/Siteimprove/alfa/pull/1716))

## 0.94.0

### Minor Changes

- **Breaking:** `#serializationId` has been replaced with `#internalId`. ([#1705](https://github.com/Siteimprove/alfa/pull/1705))

  The old `#serializationId` is now deprecated and acts as an alias to `#internalId`. It will be removed in a future version.

- **Added:** classes for ARIA and Best Practices requirements are now available. ([#1714](https://github.com/Siteimprove/alfa/pull/1714))

- **Added:** An experimental rule "SIA-R114: Title is descriptive" is now available. ([#1713](https://github.com/Siteimprove/alfa/pull/1713))

### Patch Changes

- **Fixed:** SIA-R83 is now better at detecting soft wrap opportunity in text nodes. ([#1710](https://github.com/Siteimprove/alfa/pull/1710))

- **Added:** Rules checking ARIA conformance, or Best Practices, now have a corresponding requirement. ([#1714](https://github.com/Siteimprove/alfa/pull/1714))

## 0.93.8

## 0.93.7

## 0.93.6

## 0.93.5

## 0.93.4

## 0.93.3

## 0.93.2

### Patch Changes

- **Fixed:** SIA-R66 and SIA-R69 ar now inapplicable to text in `aria-disabled` `<a>` elements without `href`. ([#1698](https://github.com/Siteimprove/alfa/pull/1698))

  See https://github.com/act-rules/act-rules.github.io/issues/2215

- **Fixed:** SIA-R83 is better at detecting clipping elements that actually have room to grow. ([#1699](https://github.com/Siteimprove/alfa/pull/1699))

- **Fixed:** SIA-R83 now correctly considers the used value of `overflow` rather than the computed one. ([#1699](https://github.com/Siteimprove/alfa/pull/1699))

## 0.93.1

## 0.93.0

### Minor Changes

- **Added:** Experimental rule SIA-ER8. It adds support for `type="password"` and more. ([#1667](https://github.com/Siteimprove/alfa/pull/1667))

### Patch Changes

- **Fixed:** SIA-R83 is now better at handling `white-space` and `text-overflow`. ([#1694](https://github.com/Siteimprove/alfa/pull/1694))

## 0.92.0

### Minor Changes

- **Changed:** Alfa packages are now (also) published on the npmjs registry. ([`5b924adf304b6f809f4c8b9d5a2f4a8950d5b10b`](https://github.com/Siteimprove/alfa/commit/5b924adf304b6f809f4c8b9d5a2f4a8950d5b10b))

## 0.91.2

## 0.91.1

## 0.91.0

### Minor Changes

- **Changed:** Dummy minor version to experiment with publish flow, use the previous or next minor version instead. ([`2a62d8a43e294ee56c18315c8fad29fbdc18c0df`](https://github.com/Siteimprove/alfa/commit/2a62d8a43e294ee56c18315c8fad29fbdc18c0df))

## 0.90.1

## 0.90.0

## 0.89.3

## 0.89.2

### Patch Changes

- **Changed:** Trying to fix a problem in generating provenance statements ([#1674](https://github.com/Siteimprove/alfa/pull/1674))

## 0.89.1

### Patch Changes

- **Added:** Trying to publish Alfa packages on the npm registry ([#1673](https://github.com/Siteimprove/alfa/pull/1673))

## 0.89.0

### Minor Changes

- **Breaking:** The serialization of diagnostic `WithBadElements` has been changed to include the serialized elements and not just the xpath. ([#1669](https://github.com/Siteimprove/alfa/pull/1669))

## 0.88.0

### Minor Changes

- **Fixed:** The publish flow was updated to a new version. ([`a2f19cf9a6c7c72b8bf085597e4f1a95ac3e4eb2`](https://github.com/Siteimprove/alfa/commit/a2f19cf9a6c7c72b8bf085597e4f1a95ac3e4eb2))

  Some 0.87.\* versions were generating uninstallable package. This should be fixed now.

## 0.87.12

## 0.87.11

## 0.87.10

## 0.87.7

## 0.87.6

## 0.87.5

## 0.87.4

### Patch Changes

- **Added:** The Alfa version is now directly available as `import { alfaVersion } from "@siteimprove/alfa-rules";` ([#1658](https://github.com/Siteimprove/alfa/pull/1658))

## 0.87.3

## 0.87.2

## 0.87.1

## 0.87.0

### Minor Changes

- **Fixed:** The rules R111 and R113 are now inapplicable to targets not visible due to scrolling. ([#1651](https://github.com/Siteimprove/alfa/pull/1651))

- **Breaking:** Optional serialization type parameters have been removed. ([#1651](https://github.com/Siteimprove/alfa/pull/1651))

### Patch Changes

- **Fixed:** Serialization options are now propagated in `.toJSON()` for all classes extending `Diagnostic`. ([#1651](https://github.com/Siteimprove/alfa/pull/1651))

- **Fixed:** R111 and R113 now computes the clickable area of a target more accurately which should reduce both number of false positives and false negatives. ([#1651](https://github.com/Siteimprove/alfa/pull/1651))

## 0.86.2

## 0.86.1

## 0.86.0

### Minor Changes

- **Breaking:** TS resolution has been changed to `Node16`, target to `es2022`. ([#1636](https://github.com/Siteimprove/alfa/pull/1636))

- **Breaking:** Alfa is now distributed as ESM rather than CJS modules; projects using it must be ESM or use dynamic `import()`. ([#1636](https://github.com/Siteimprove/alfa/pull/1636))

  ⚠️ This is the last of a series of changes on the internal structure and build process of distributed packages that was started with v0.85.0.

## 0.85.1

## 0.85.0

### Minor Changes

- **Breaking:** The .js files are now built in the `dist` folder rather than in `src`. ([#1628](https://github.com/Siteimprove/alfa/pull/1628))

  ⚠️ This is the first of a series of changes on the internal structure and build process of distributed packages. It is probably better to not use this version and wait until more of these internal changes have been done to jump directly to the final result. We are internally releasing these changes for validation purpose only.

  This should not impact consumers, the `package.json` files should be set correctly to consume these files.

## 0.84.0

## 0.83.1

## 0.83.0

### Patch Changes

- **Fixed:** Background images with empty URL are now ignored when computing background colors (SIA-R66, SIA-R69). ([#1627](https://github.com/Siteimprove/alfa/pull/1627))

## 0.82.0

### Minor Changes

- **Added:** Serialization options are now accepted, and passed on, by `toJSON()` on these types. ([#1622](https://github.com/Siteimprove/alfa/pull/1622))

- **Added:** Verbosity option has been added to JSON serialization of alfa-tree `Node` and to `Outcome` and `Group`. ([#1618](https://github.com/Siteimprove/alfa/pull/1618))

- **Breaking:** Node 18 is no longer supported. ([#1618](https://github.com/Siteimprove/alfa/pull/1618))

## 0.81.0

### Patch Changes

- **Added:** Each package now contains its internal dependency graph in its `docs` directory. ([#1610](https://github.com/Siteimprove/alfa/pull/1610))

## 0.80.0

## 0.79.1

## 0.79.0

### Minor Changes

- **Changed:** R111 and R113 `Outcome` namespaces have been combined and renamed to `TargetSize` ([#1601](https://github.com/Siteimprove/alfa/pull/1601))

## 0.78.2

### Patch Changes

- **Fixed:** R111 and R113 now more accurately detects targets that are part of text. ([#1598](https://github.com/Siteimprove/alfa/pull/1598))

## 0.78.1

## 0.78.0

### Patch Changes

- **Fixed:** R111 and R113 are no longer applicable to invisible targets and targets inside a paragraph ([#1594](https://github.com/Siteimprove/alfa/pull/1594))

## 0.77.0

### Minor Changes

- **Changed:** R113 now sends more information about how it succeed and the other targets that caused the spacing criteria to fail. ([#1592](https://github.com/Siteimprove/alfa/pull/1592))

### Patch Changes

- **Fixed:** R113 spacing condition is now calculated more accurately. ([#1592](https://github.com/Siteimprove/alfa/pull/1592))

  The part of the condition requiring computation of intersections between the circle around the center of the target and the bounding box of all other targets has been implemented.

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
