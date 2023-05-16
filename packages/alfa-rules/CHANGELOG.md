# @siteimprove/alfa-rules

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

- Updated dependencies [[`1134c0f58`](https://github.com/Siteimprove/alfa/commit/1134c0f580f1562fdb9becd3f5e442abcb86dc86), [`17d79da6b`](https://github.com/Siteimprove/alfa/commit/17d79da6b2e6d7fd789344ba62cb6fe5744c02a4), [`abc7b9744`](https://github.com/Siteimprove/alfa/commit/abc7b9744985d9935a079e82fddfa668463442c0), [`6b5f7be59`](https://github.com/Siteimprove/alfa/commit/6b5f7be5918bbf04ac07bcbf422c3c75304ce4de), [`4eb920fbd`](https://github.com/Siteimprove/alfa/commit/4eb920fbd665f0a84432a79f87a11531480d1b29), [`232b93c59`](https://github.com/Siteimprove/alfa/commit/232b93c592cf8f20709c7430869e428d07e75bde), [`af412a630`](https://github.com/Siteimprove/alfa/commit/af412a6309e7eb1e8590d3f5e269bd95ac7d6f50), [`5684e3ab3`](https://github.com/Siteimprove/alfa/commit/5684e3ab32fe5022a11f4592d06acb4b7039d2a1), [`4eb920fbd`](https://github.com/Siteimprove/alfa/commit/4eb920fbd665f0a84432a79f87a11531480d1b29), [`4eb920fbd`](https://github.com/Siteimprove/alfa/commit/4eb920fbd665f0a84432a79f87a11531480d1b29), [`af412a630`](https://github.com/Siteimprove/alfa/commit/af412a6309e7eb1e8590d3f5e269bd95ac7d6f50)]:
  - @siteimprove/alfa-css@0.63.0
  - @siteimprove/alfa-dom@0.63.0
  - @siteimprove/alfa-option@0.63.0
  - @siteimprove/alfa-style@0.63.0
  - @siteimprove/alfa-web@0.63.0
  - @siteimprove/alfa-result@0.63.0
  - @siteimprove/alfa-cascade@0.63.0
  - @siteimprove/alfa-media@0.63.0
  - @siteimprove/alfa-selector@0.63.0
  - @siteimprove/alfa-aria@0.63.0
  - @siteimprove/alfa-table@0.63.0
  - @siteimprove/alfa-act@0.63.0
  - @siteimprove/alfa-affine@0.63.0
  - @siteimprove/alfa-array@0.63.0
  - @siteimprove/alfa-cache@0.63.0
  - @siteimprove/alfa-earl@0.63.0
  - @siteimprove/alfa-http@0.63.0
  - @siteimprove/alfa-iana@0.63.0
  - @siteimprove/alfa-iterable@0.63.0
  - @siteimprove/alfa-list@0.63.0
  - @siteimprove/alfa-map@0.63.0
  - @siteimprove/alfa-record@0.63.0
  - @siteimprove/alfa-sarif@0.63.0
  - @siteimprove/alfa-sequence@0.63.0
  - @siteimprove/alfa-set@0.63.0
  - @siteimprove/alfa-url@0.63.0
  - @siteimprove/alfa-wcag@0.63.0
  - @siteimprove/alfa-comparable@0.63.0
  - @siteimprove/alfa-device@0.63.0
  - @siteimprove/alfa-equatable@0.63.0
  - @siteimprove/alfa-future@0.63.0
  - @siteimprove/alfa-hash@0.63.0
  - @siteimprove/alfa-json@0.63.0
  - @siteimprove/alfa-math@0.63.0
  - @siteimprove/alfa-predicate@0.63.0
  - @siteimprove/alfa-refinement@0.63.0
  - @siteimprove/alfa-thunk@0.63.0
  - @siteimprove/alfa-trilean@0.63.0

## 0.62.2

### Patch Changes

- Updated dependencies []:
  - @siteimprove/alfa-act@0.62.2
  - @siteimprove/alfa-affine@0.62.2
  - @siteimprove/alfa-aria@0.62.2
  - @siteimprove/alfa-array@0.62.2
  - @siteimprove/alfa-cache@0.62.2
  - @siteimprove/alfa-cascade@0.62.2
  - @siteimprove/alfa-comparable@0.62.2
  - @siteimprove/alfa-css@0.62.2
  - @siteimprove/alfa-device@0.62.2
  - @siteimprove/alfa-dom@0.62.2
  - @siteimprove/alfa-earl@0.62.2
  - @siteimprove/alfa-equatable@0.62.2
  - @siteimprove/alfa-future@0.62.2
  - @siteimprove/alfa-hash@0.62.2
  - @siteimprove/alfa-http@0.62.2
  - @siteimprove/alfa-iana@0.62.2
  - @siteimprove/alfa-iterable@0.62.2
  - @siteimprove/alfa-json@0.62.2
  - @siteimprove/alfa-list@0.62.2
  - @siteimprove/alfa-map@0.62.2
  - @siteimprove/alfa-math@0.62.2
  - @siteimprove/alfa-media@0.62.2
  - @siteimprove/alfa-option@0.62.2
  - @siteimprove/alfa-predicate@0.62.2
  - @siteimprove/alfa-record@0.62.2
  - @siteimprove/alfa-refinement@0.62.2
  - @siteimprove/alfa-result@0.62.2
  - @siteimprove/alfa-sarif@0.62.2
  - @siteimprove/alfa-selector@0.62.2
  - @siteimprove/alfa-sequence@0.62.2
  - @siteimprove/alfa-set@0.62.2
  - @siteimprove/alfa-style@0.62.2
  - @siteimprove/alfa-table@0.62.2
  - @siteimprove/alfa-thunk@0.62.2
  - @siteimprove/alfa-trilean@0.62.2
  - @siteimprove/alfa-url@0.62.2
  - @siteimprove/alfa-wcag@0.62.2
  - @siteimprove/alfa-web@0.62.2

## 0.62.1

### Patch Changes

- Updated dependencies []:
  - @siteimprove/alfa-act@0.62.1
  - @siteimprove/alfa-affine@0.62.1
  - @siteimprove/alfa-aria@0.62.1
  - @siteimprove/alfa-array@0.62.1
  - @siteimprove/alfa-cache@0.62.1
  - @siteimprove/alfa-cascade@0.62.1
  - @siteimprove/alfa-comparable@0.62.1
  - @siteimprove/alfa-css@0.62.1
  - @siteimprove/alfa-device@0.62.1
  - @siteimprove/alfa-dom@0.62.1
  - @siteimprove/alfa-earl@0.62.1
  - @siteimprove/alfa-equatable@0.62.1
  - @siteimprove/alfa-future@0.62.1
  - @siteimprove/alfa-hash@0.62.1
  - @siteimprove/alfa-http@0.62.1
  - @siteimprove/alfa-iana@0.62.1
  - @siteimprove/alfa-iterable@0.62.1
  - @siteimprove/alfa-json@0.62.1
  - @siteimprove/alfa-list@0.62.1
  - @siteimprove/alfa-map@0.62.1
  - @siteimprove/alfa-math@0.62.1
  - @siteimprove/alfa-media@0.62.1
  - @siteimprove/alfa-option@0.62.1
  - @siteimprove/alfa-predicate@0.62.1
  - @siteimprove/alfa-record@0.62.1
  - @siteimprove/alfa-refinement@0.62.1
  - @siteimprove/alfa-result@0.62.1
  - @siteimprove/alfa-sarif@0.62.1
  - @siteimprove/alfa-selector@0.62.1
  - @siteimprove/alfa-sequence@0.62.1
  - @siteimprove/alfa-set@0.62.1
  - @siteimprove/alfa-style@0.62.1
  - @siteimprove/alfa-table@0.62.1
  - @siteimprove/alfa-thunk@0.62.1
  - @siteimprove/alfa-trilean@0.62.1
  - @siteimprove/alfa-url@0.62.1
  - @siteimprove/alfa-wcag@0.62.1
  - @siteimprove/alfa-web@0.62.1
