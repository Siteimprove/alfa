# @siteimprove/alfa-css

## 0.67.0

## 0.66.0

### Minor Changes

- **Added:** `Shadow` are now calculatable. ([#1455](https://github.com/Siteimprove/alfa/pull/1455))

- **Added:** A `List.parseSpaceSeparated` parser is now available. ([#1457](https://github.com/Siteimprove/alfa/pull/1457))

- **Added:** CSS `transfrom` functions now accept calculations in any of their numerical components. ([#1457](https://github.com/Siteimprove/alfa/pull/1457))

- **Breaking:** CSS `rotate` and `skew` now convert their angles into degrees at build time. ([#1457](https://github.com/Siteimprove/alfa/pull/1457))

  This means that no matter which angles are provided, only angles in degrees are stored. Serialisation will thus also return values in degrees.

- **Added:** `List.parseCommaSeparated` and `List.parseSpaceSeparated` now accept optional `lower` and ` upper` numbers of items to parse. ([#1457](https://github.com/Siteimprove/alfa/pull/1457))

  If unspecified, they will parse any number of items, otherwise they will parse at least `lower` and at most `upper` items. The parsers will fail if there are less; they won't fail if there are more, but these won't be consumed.
  The parsers will always accepts at least one item, even if `lower` is 0.

- **Breaking:** The `Transform.parse` parser is now considered `@internal`. ([#1457](https://github.com/Siteimprove/alfa/pull/1457))

  It should not be used externally since individual transform functions are normally only used in contexts where the actual transformation is known in advance, in which case the specific parser (`Matrix.parse`, `Rotate.parse`, …) can be used instead. `Transform.parseList` is still available externally.

## 0.65.1

## 0.65.0

### Minor Changes

- **Breaking:** `List` and `Tuple` can now only contain other CSS `Value`. ([#1446](https://github.com/Siteimprove/alfa/pull/1446))

- **Breaking:** The `CALC` parameter of `Value` now defaults to `boolean` instead of `false`. ([#1443](https://github.com/Siteimprove/alfa/pull/1443))

  We do not assume anymore that `Value` are not calculated (`CALC=false`), the default is now `boolean` (i.e. we don't know).

- **Removed:** Many pieces of code are no longer exported. These were mostly internal exports that are no longer used in other files and should not impact intended usage of the packages. ([#1437](https://github.com/Siteimprove/alfa/pull/1437))

- **Added:** An abstraction for `AnglePercentage` is now available. ([#1443](https://github.com/Siteimprove/alfa/pull/1443))

- **Added:** `Tuple` and `Value` can now be built of calculated values. ([#1446](https://github.com/Siteimprove/alfa/pull/1446))

  Both calculated and non-calculated values can be mixed. The collection will have its `hasCalculation` flag set to true if at least one of the member has.
  The collections also come with a `resolve` method that take a `Resolver` able to resolve all members and apply it to the members.

- **Breaking:** The resolvers for `Length` and `Percentage` are now wrapped in an object. ([#1443](https://github.com/Siteimprove/alfa/pull/1443))

  The resolver for `Length` is now a `{ length: Mapper<…> }` instead of being just a `Mapper`, similarly the resolver for `Percentage` is now a `{ basePercentage: … }`. This allows for more complex value types who require more than one resolver (e.g. length-percentage require both a length resolver and a percentage resolver).

- **Added:** A `LengthPercentage` abstraction is now available. ([#1443](https://github.com/Siteimprove/alfa/pull/1443))

  It is mostly `Length | Percentage`, plus the mixed calculations (e.g. `calc(1em + 2px)`). It comes with the usual helper functions to parse and resolve it.

- **Removed:** The `Gradient.parseItem` helper has been removed as it wasn't used. ([#1447](https://github.com/Siteimprove/alfa/pull/1447))

  If need be, use `Parser.either(Gradient.parseHint, Gradient.parseStop)` instead.

- **Added:** `Function.parse` now also accepts a predicate instead of just a name to compare to. ([#1448](https://github.com/Siteimprove/alfa/pull/1448))

- **Added:** CSS colors now accept calculated values. ([#1448](https://github.com/Siteimprove/alfa/pull/1448))

  CSS colors in RGB and HSL format now accept calculations as any of their components. Style properties that use colors have been updated accordingly.

- **Added:** `Value` can now resolve to a different `type` than the current one. ([#1443](https://github.com/Siteimprove/alfa/pull/1443))

  For example, a `Value<"length-percentage">` will fully resolve as a `Value<"length">`, not as a `Value<"length-percentage">`.

  The `Value` type accepts a third type parameter (defaulting to the first one), which is (the representation of) the type into which the value will resolve. The `Value#resolve` method now returns this type of `Value`.

### Patch Changes

- **Fixed:** HSL and RGB colors now also accept the `none` keyword for any component when in modern syntax. ([#1448](https://github.com/Siteimprove/alfa/pull/1448))

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
