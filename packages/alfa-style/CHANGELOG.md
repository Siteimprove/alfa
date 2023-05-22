# @siteimprove/alfa-style

## 0.63.2

### Patch Changes

- Updated dependencies []:
  - @siteimprove/alfa-applicative@0.63.2
  - @siteimprove/alfa-array@0.63.2
  - @siteimprove/alfa-cache@0.63.2
  - @siteimprove/alfa-cascade@0.63.2
  - @siteimprove/alfa-css@0.63.2
  - @siteimprove/alfa-device@0.63.2
  - @siteimprove/alfa-dom@0.63.2
  - @siteimprove/alfa-equatable@0.63.2
  - @siteimprove/alfa-functor@0.63.2
  - @siteimprove/alfa-hash@0.63.2
  - @siteimprove/alfa-iterable@0.63.2
  - @siteimprove/alfa-json@0.63.2
  - @siteimprove/alfa-map@0.63.2
  - @siteimprove/alfa-mapper@0.63.2
  - @siteimprove/alfa-math@0.63.2
  - @siteimprove/alfa-monad@0.63.2
  - @siteimprove/alfa-option@0.63.2
  - @siteimprove/alfa-parser@0.63.2
  - @siteimprove/alfa-predicate@0.63.2
  - @siteimprove/alfa-refinement@0.63.2
  - @siteimprove/alfa-result@0.63.2
  - @siteimprove/alfa-selective@0.63.2
  - @siteimprove/alfa-selector@0.63.2
  - @siteimprove/alfa-set@0.63.2
  - @siteimprove/alfa-slice@0.63.2

## 0.63.1

### Patch Changes

- Updated dependencies []:
  - @siteimprove/alfa-applicative@0.63.1
  - @siteimprove/alfa-array@0.63.1
  - @siteimprove/alfa-cache@0.63.1
  - @siteimprove/alfa-cascade@0.63.1
  - @siteimprove/alfa-css@0.63.1
  - @siteimprove/alfa-device@0.63.1
  - @siteimprove/alfa-dom@0.63.1
  - @siteimprove/alfa-equatable@0.63.1
  - @siteimprove/alfa-functor@0.63.1
  - @siteimprove/alfa-hash@0.63.1
  - @siteimprove/alfa-iterable@0.63.1
  - @siteimprove/alfa-json@0.63.1
  - @siteimprove/alfa-map@0.63.1
  - @siteimprove/alfa-mapper@0.63.1
  - @siteimprove/alfa-math@0.63.1
  - @siteimprove/alfa-monad@0.63.1
  - @siteimprove/alfa-option@0.63.1
  - @siteimprove/alfa-parser@0.63.1
  - @siteimprove/alfa-predicate@0.63.1
  - @siteimprove/alfa-refinement@0.63.1
  - @siteimprove/alfa-result@0.63.1
  - @siteimprove/alfa-selective@0.63.1
  - @siteimprove/alfa-selector@0.63.1
  - @siteimprove/alfa-set@0.63.1
  - @siteimprove/alfa-slice@0.63.1

## 0.63.0

### Minor Changes

- **Breaking:** The way style properties are defined and registred has been changed, including some changes in names. ([#1404](https://github.com/Siteimprove/alfa/pull/1404))

  The `alfa-style` package doesn't export a `Property` class and namespace anymore. These functionalities are now split in the `Longhands` and `Shorthands` exports. Most `Property.foo` are now available as `Longhands.foo` (notably, `Longhands.Name` and `Longhands.get`); most `Property.Shorthand.foo` are now available as `Shorthands.foo`.

- **Added:** New abstraction for math expressions ([#1406](https://github.com/Siteimprove/alfa/pull/1406))

  Added an abstraction for length, length-percentage and number that handle the possible math expressions in these values.

### Patch Changes

- **Fixed:** more style properties now accept calculations and math expressions as their value. ([#1411](https://github.com/Siteimprove/alfa/pull/1411))

  See the associated Pull Request for the exact list.

- Updated dependencies [[`1134c0f58`](https://github.com/Siteimprove/alfa/commit/1134c0f580f1562fdb9becd3f5e442abcb86dc86), [`17d79da6b`](https://github.com/Siteimprove/alfa/commit/17d79da6b2e6d7fd789344ba62cb6fe5744c02a4), [`abc7b9744`](https://github.com/Siteimprove/alfa/commit/abc7b9744985d9935a079e82fddfa668463442c0), [`6b5f7be59`](https://github.com/Siteimprove/alfa/commit/6b5f7be5918bbf04ac07bcbf422c3c75304ce4de), [`4eb920fbd`](https://github.com/Siteimprove/alfa/commit/4eb920fbd665f0a84432a79f87a11531480d1b29), [`4eb920fbd`](https://github.com/Siteimprove/alfa/commit/4eb920fbd665f0a84432a79f87a11531480d1b29), [`af412a630`](https://github.com/Siteimprove/alfa/commit/af412a6309e7eb1e8590d3f5e269bd95ac7d6f50)]:
  - @siteimprove/alfa-css@0.63.0
  - @siteimprove/alfa-dom@0.63.0
  - @siteimprove/alfa-option@0.63.0
  - @siteimprove/alfa-result@0.63.0
  - @siteimprove/alfa-cascade@0.63.0
  - @siteimprove/alfa-selector@0.63.0
  - @siteimprove/alfa-array@0.63.0
  - @siteimprove/alfa-cache@0.63.0
  - @siteimprove/alfa-iterable@0.63.0
  - @siteimprove/alfa-map@0.63.0
  - @siteimprove/alfa-parser@0.63.0
  - @siteimprove/alfa-set@0.63.0
  - @siteimprove/alfa-slice@0.63.0
  - @siteimprove/alfa-applicative@0.63.0
  - @siteimprove/alfa-device@0.63.0
  - @siteimprove/alfa-equatable@0.63.0
  - @siteimprove/alfa-functor@0.63.0
  - @siteimprove/alfa-hash@0.63.0
  - @siteimprove/alfa-json@0.63.0
  - @siteimprove/alfa-mapper@0.63.0
  - @siteimprove/alfa-math@0.63.0
  - @siteimprove/alfa-monad@0.63.0
  - @siteimprove/alfa-predicate@0.63.0
  - @siteimprove/alfa-refinement@0.63.0
  - @siteimprove/alfa-selective@0.63.0

## 0.62.2

### Patch Changes

- Updated dependencies []:
  - @siteimprove/alfa-applicative@0.62.2
  - @siteimprove/alfa-array@0.62.2
  - @siteimprove/alfa-cache@0.62.2
  - @siteimprove/alfa-cascade@0.62.2
  - @siteimprove/alfa-css@0.62.2
  - @siteimprove/alfa-device@0.62.2
  - @siteimprove/alfa-dom@0.62.2
  - @siteimprove/alfa-equatable@0.62.2
  - @siteimprove/alfa-functor@0.62.2
  - @siteimprove/alfa-hash@0.62.2
  - @siteimprove/alfa-iterable@0.62.2
  - @siteimprove/alfa-json@0.62.2
  - @siteimprove/alfa-map@0.62.2
  - @siteimprove/alfa-mapper@0.62.2
  - @siteimprove/alfa-math@0.62.2
  - @siteimprove/alfa-monad@0.62.2
  - @siteimprove/alfa-option@0.62.2
  - @siteimprove/alfa-parser@0.62.2
  - @siteimprove/alfa-predicate@0.62.2
  - @siteimprove/alfa-refinement@0.62.2
  - @siteimprove/alfa-result@0.62.2
  - @siteimprove/alfa-selector@0.62.2
  - @siteimprove/alfa-set@0.62.2
  - @siteimprove/alfa-slice@0.62.2

## 0.62.1

### Patch Changes

- Updated dependencies []:
  - @siteimprove/alfa-applicative@0.62.1
  - @siteimprove/alfa-array@0.62.1
  - @siteimprove/alfa-cache@0.62.1
  - @siteimprove/alfa-cascade@0.62.1
  - @siteimprove/alfa-css@0.62.1
  - @siteimprove/alfa-device@0.62.1
  - @siteimprove/alfa-dom@0.62.1
  - @siteimprove/alfa-equatable@0.62.1
  - @siteimprove/alfa-functor@0.62.1
  - @siteimprove/alfa-hash@0.62.1
  - @siteimprove/alfa-iterable@0.62.1
  - @siteimprove/alfa-json@0.62.1
  - @siteimprove/alfa-map@0.62.1
  - @siteimprove/alfa-mapper@0.62.1
  - @siteimprove/alfa-math@0.62.1
  - @siteimprove/alfa-monad@0.62.1
  - @siteimprove/alfa-option@0.62.1
  - @siteimprove/alfa-parser@0.62.1
  - @siteimprove/alfa-predicate@0.62.1
  - @siteimprove/alfa-refinement@0.62.1
  - @siteimprove/alfa-result@0.62.1
  - @siteimprove/alfa-selector@0.62.1
  - @siteimprove/alfa-set@0.62.1
  - @siteimprove/alfa-slice@0.62.1
