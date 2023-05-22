# @siteimprove/alfa-dom

## 0.63.1

### Patch Changes

- Updated dependencies []:
  - @siteimprove/alfa-array@0.63.1
  - @siteimprove/alfa-cache@0.63.1
  - @siteimprove/alfa-css@0.63.1
  - @siteimprove/alfa-earl@0.63.1
  - @siteimprove/alfa-equatable@0.63.1
  - @siteimprove/alfa-flags@0.63.1
  - @siteimprove/alfa-iterable@0.63.1
  - @siteimprove/alfa-json@0.63.1
  - @siteimprove/alfa-lazy@0.63.1
  - @siteimprove/alfa-media@0.63.1
  - @siteimprove/alfa-option@0.63.1
  - @siteimprove/alfa-predicate@0.63.1
  - @siteimprove/alfa-refinement@0.63.1
  - @siteimprove/alfa-sarif@0.63.1
  - @siteimprove/alfa-sequence@0.63.1
  - @siteimprove/alfa-trampoline@0.63.1
  - @siteimprove/alfa-tree@0.63.1

## 0.63.0

### Minor Changes

- **Breaking:** `hasUniqueId` is now directly a `Predicate` ([#1408](https://github.com/Siteimprove/alfa/pull/1408))

  It used to a be `() => Predicate`, the useless void parameter has now been removed. To migrate, simply replace any call to `hasUniqueId()` by `hasUniqueId` (remove the useless empty parameter).

- **Added:** `hasTabIndex` now also accepts number values ([#1409](https://github.com/Siteimprove/alfa/pull/1409))

  `hasTabIndex` accepts numbers and will be satisfied if the tabindex is any of these numbers. It still alternatively accepts a `Predicate<number>`.

### Patch Changes

- Updated dependencies [[`1134c0f58`](https://github.com/Siteimprove/alfa/commit/1134c0f580f1562fdb9becd3f5e442abcb86dc86), [`abc7b9744`](https://github.com/Siteimprove/alfa/commit/abc7b9744985d9935a079e82fddfa668463442c0), [`4eb920fbd`](https://github.com/Siteimprove/alfa/commit/4eb920fbd665f0a84432a79f87a11531480d1b29), [`4eb920fbd`](https://github.com/Siteimprove/alfa/commit/4eb920fbd665f0a84432a79f87a11531480d1b29)]:
  - @siteimprove/alfa-css@0.63.0
  - @siteimprove/alfa-option@0.63.0
  - @siteimprove/alfa-media@0.63.0
  - @siteimprove/alfa-array@0.63.0
  - @siteimprove/alfa-cache@0.63.0
  - @siteimprove/alfa-earl@0.63.0
  - @siteimprove/alfa-iterable@0.63.0
  - @siteimprove/alfa-sarif@0.63.0
  - @siteimprove/alfa-sequence@0.63.0
  - @siteimprove/alfa-tree@0.63.0
  - @siteimprove/alfa-equatable@0.63.0
  - @siteimprove/alfa-flags@0.63.0
  - @siteimprove/alfa-json@0.63.0
  - @siteimprove/alfa-lazy@0.63.0
  - @siteimprove/alfa-predicate@0.63.0
  - @siteimprove/alfa-refinement@0.63.0
  - @siteimprove/alfa-trampoline@0.63.0

## 0.62.2

### Patch Changes

- Updated dependencies []:
  - @siteimprove/alfa-cache@0.62.2
  - @siteimprove/alfa-css@0.62.2
  - @siteimprove/alfa-earl@0.62.2
  - @siteimprove/alfa-equatable@0.62.2
  - @siteimprove/alfa-flags@0.62.2
  - @siteimprove/alfa-iterable@0.62.2
  - @siteimprove/alfa-json@0.62.2
  - @siteimprove/alfa-lazy@0.62.2
  - @siteimprove/alfa-media@0.62.2
  - @siteimprove/alfa-option@0.62.2
  - @siteimprove/alfa-predicate@0.62.2
  - @siteimprove/alfa-refinement@0.62.2
  - @siteimprove/alfa-sarif@0.62.2
  - @siteimprove/alfa-sequence@0.62.2
  - @siteimprove/alfa-trampoline@0.62.2
  - @siteimprove/alfa-tree@0.62.2

## 0.62.1

### Patch Changes

- Updated dependencies []:
  - @siteimprove/alfa-cache@0.62.1
  - @siteimprove/alfa-css@0.62.1
  - @siteimprove/alfa-earl@0.62.1
  - @siteimprove/alfa-equatable@0.62.1
  - @siteimprove/alfa-flags@0.62.1
  - @siteimprove/alfa-iterable@0.62.1
  - @siteimprove/alfa-json@0.62.1
  - @siteimprove/alfa-lazy@0.62.1
  - @siteimprove/alfa-media@0.62.1
  - @siteimprove/alfa-option@0.62.1
  - @siteimprove/alfa-predicate@0.62.1
  - @siteimprove/alfa-refinement@0.62.1
  - @siteimprove/alfa-sarif@0.62.1
  - @siteimprove/alfa-sequence@0.62.1
  - @siteimprove/alfa-trampoline@0.62.1
  - @siteimprove/alfa-tree@0.62.1
