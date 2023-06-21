# @siteimprove/alfa-style

## 0.64.0

### Minor Changes

- **Breaking:** New abstractions for calculatable numeric values (numbers, percentages, dimensions) are introduced and used in style properties. Currently, style properties only accept non-calculated numeric (except for some properties that already accepted calculated lengths or length-percentages and keep doing so). ([#1432](https://github.com/Siteimprove/alfa/pull/1432))

  These abstractions are now exported from `@siteimprove/alfa-css` instead of the old abstractions which didn't accept calculations. In order to keep the functionalities of the old abstractions, replace `Foo` (`Number`, `Length`, …) with `Foo.Fixed`.

  The new abstractions come with a `#resolve()` method which resolve any remaining calculation and returns a `Fixed` value. These methods need various resolvers argument depending on the precise abstraction (e.g. `Length#resolve` needs to know how to resolve relative lengths into `px`).

- **Breaking:** The compound `Length` type has been removed from `alfa-style`. The `Length` type from `alfa-css/src/value/numeric` should be used instead. ([#1424](https://github.com/Siteimprove/alfa/pull/1424))

- **Added:** a `Longhand.fromKeywords` helper is now available to define longhands whose value can only be a list of keywords. ([#1431](https://github.com/Siteimprove/alfa/pull/1431))

- **Breaking:** the `NumberPercentage` abstraction, which doesn't exist in CSS, has been removed. ([#1432](https://github.com/Siteimprove/alfa/pull/1432))

- **Breaking:** The `Resolver.percentage` helper has been removed. Instead, the `Percentage#resolve(base)` method (from `@siteimprove/alfa-css`) provides the same functionality. ([#1432](https://github.com/Siteimprove/alfa/pull/1432))

- **Fixed:** `background-position-x` and `background-position-y` now correctly accept keyword values. ([#1431](https://github.com/Siteimprove/alfa/pull/1431))

  **Fixed:** `text-shadow` now correctly accept `none`, or a list of shadows.

- **Added:** `List` and `Tuple` CSS values are now exported from `@siteimprove/alfa-css`. ([#1416](https://github.com/Siteimprove/alfa/pull/1416))

  These values were previously internal to the `@siteimprove/alfa-style` package and are now grouped with the other CSS values.

  **Added:** A `List.parseCommaSeparated` helper is now provided, taking a value parser as input and returning a parser for list of values separated by commas.

  **Added:** `List` now implement the `Functor` interface.

## 0.63.3

### Patch Changes

- Updated dependencies []:
  - @siteimprove/alfa-applicative@0.63.3
  - @siteimprove/alfa-array@0.63.3
  - @siteimprove/alfa-cache@0.63.3
  - @siteimprove/alfa-cascade@0.63.3
  - @siteimprove/alfa-css@0.63.3
  - @siteimprove/alfa-device@0.63.3
  - @siteimprove/alfa-dom@0.63.3
  - @siteimprove/alfa-equatable@0.63.3
  - @siteimprove/alfa-functor@0.63.3
  - @siteimprove/alfa-hash@0.63.3
  - @siteimprove/alfa-iterable@0.63.3
  - @siteimprove/alfa-json@0.63.3
  - @siteimprove/alfa-map@0.63.3
  - @siteimprove/alfa-mapper@0.63.3
  - @siteimprove/alfa-math@0.63.3
  - @siteimprove/alfa-monad@0.63.3
  - @siteimprove/alfa-option@0.63.3
  - @siteimprove/alfa-parser@0.63.3
  - @siteimprove/alfa-predicate@0.63.3
  - @siteimprove/alfa-refinement@0.63.3
  - @siteimprove/alfa-result@0.63.3
  - @siteimprove/alfa-selective@0.63.3
  - @siteimprove/alfa-selector@0.63.3
  - @siteimprove/alfa-set@0.63.3
  - @siteimprove/alfa-slice@0.63.3

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
