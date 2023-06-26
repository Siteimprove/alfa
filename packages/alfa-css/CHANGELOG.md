# @siteimprove/alfa-css

## 0.64.0

### Minor Changes

- **Breaking:** New abstractions for calculatable numeric values (numbers, percentages, dimensions) are introduced and used in style properties. Currently, style properties only accept non-calculated numeric (except for some properties that already accepted calculated lengths or length-percentages and keep doing so). ([#1432](https://github.com/Siteimprove/alfa/pull/1432))

  These abstractions are now exported from `@siteimprove/alfa-css` instead of the old abstractions which didn't accept calculations. In order to keep the functionalities of the old abstractions, replace `Foo` (`Number`, `Length`, …) with `Foo.Fixed`.

  The new abstractions come with a `#resolve()` method which resolve any remaining calculation and returns a `Fixed` value. These methods need various resolvers argument depending on the precise abstraction (e.g. `Length#resolve` needs to know how to resolve relative lengths into `px`).

- **Breaking:** The redundant second type parameter (Unit category) of Dimensions has been removed and is now automatically inferred from the first parameter (type string representation). ([#1432](https://github.com/Siteimprove/alfa/pull/1432))

- **Breaking:** The compound `Length` type has been removed from `alfa-style`. The `Length` type from `alfa-css/src/value/numeric` should be used instead. ([#1424](https://github.com/Siteimprove/alfa/pull/1424))

- **Breaking:** `Math.resolve` now returns a `Result<Numeric, string>` instead of an `Option`. ([#1416](https://github.com/Siteimprove/alfa/pull/1416))
  Invalid expressions return an error message.

  **Breaking:** No resolver is needed for `Math.resolve` on `Number` expressions.

  **Breaking:** Math expression converters (`.toLength`, …) now return a `Result<T, string>` instead of an `option<T>`.

- **Breaking:** The `Position.Center`, `Position.Horizontal`, `Position.Vertical` types have been grouped under the `Position.Keywords` namespace. ([#1431](https://github.com/Siteimprove/alfa/pull/1431))

- **Added:** Most CSS value types now export a `Foo.Canonical` type which is the canonical representation of the type with calculations resolved, relative values absolutized, and dimensions converted to their canonical units. The `Canonical` type is normally the one used to represent computed values of style properties. ([#1432](https://github.com/Siteimprove/alfa/pull/1432))

- **Breaking:** `Value` now require a `resolve` method. ([#1416](https://github.com/Siteimprove/alfa/pull/1416))
  This method resolves calculation into actual values.

  **Added:** `Value` type now accepts a second boolean type parameter indicating whether the value may or not contain unresolved calculation.
  This parameter defaults to `false`. Its value is also available via the `Value#hasCalculation()` type predicate.

- **Added:** `List` and `Tuple` CSS values are now exported from `@siteimprove/alfa-css`. ([#1416](https://github.com/Siteimprove/alfa/pull/1416))

  These values were previously internal to the `@siteimprove/alfa-style` package and are now grouped with the other CSS values.

  **Added:** A `List.parseCommaSeparated` helper is now provided, taking a value parser as input and returning a parser for list of values separated by commas.

  **Added:** `List` now implement the `Functor` interface.

## 0.63.3

## 0.63.2

## 0.63.1

## 0.63.0

### Minor Changes

- **Breaking:** `Linear.parse` and `Radial.parse` now require an item parser. ([#1412](https://github.com/Siteimprove/alfa/pull/1412))

  Both gradient parsing functions where using `Gradient.parseItemList`, which created a circular dependency between the files. The circle has been broken by injecting the item list parser in the individual parser. To migrate, simply call `Linear.parse(Gradient.parseItemList)` instead of `Linear.parse` (same with `Radial`).

- **Breaking:** `Math.resolve` now returns a `Result<Numeric, string>` instead of an `Option`. ([#1406](https://github.com/Siteimprove/alfa/pull/1406))

  Invalid expressions return an error message.

  **Breaking:** No resolver is needed for `Math.resolve` on `Number` expressions.

- **Removed:** `Math.parseLengthNumberPercentage` is no longer available. ([#1406](https://github.com/Siteimprove/alfa/pull/1406))

  Instead, a combination of `parseLengthPercentage` and `parseNumber` should be used.

## 0.62.2

## 0.62.1
