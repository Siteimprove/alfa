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

## 0.63.2

## 0.63.1

## 0.63.0

### Minor Changes

- **Breaking:** The way style properties are defined and registered has been changed, including some changes in names. ([#1404](https://github.com/Siteimprove/alfa/pull/1404))

  The `alfa-style` package doesn't export a `Property` class and namespace anymore. These functionalities are now split in the `Longhands` and `Shorthands` exports. Most `Property.foo` are now available as `Longhands.foo` (notably, `Longhands.Name` and `Longhands.get`); most `Property.Shorthand.foo` are now available as `Shorthands.foo`.

- **Added:** New abstraction for math expressions ([#1406](https://github.com/Siteimprove/alfa/pull/1406))

  Added an abstraction for length, length-percentage and number that handle the possible math expressions in these values.

### Patch Changes

- **Fixed:** more style properties now accept calculations and math expressions as their value. ([#1411](https://github.com/Siteimprove/alfa/pull/1411))

  See the associated Pull Request for the exact list.

## 0.62.2

## 0.62.1
