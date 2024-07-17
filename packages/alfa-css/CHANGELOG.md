# @siteimprove/alfa-css

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

### Patch Changes

- **Fixed:** A type declaration. ([#1631](https://github.com/Siteimprove/alfa/pull/1631))

## 0.83.0

### Minor Changes

- **Added:** `Unit` now have a `Canonical` unit (e.g., `Length.Canonical`, …) ([#1625](https://github.com/Siteimprove/alfa/pull/1625))

### Patch Changes

- **Fixed:** Calculations containing products and divisions of dimensions are better handled. ([#1625](https://github.com/Siteimprove/alfa/pull/1625))

  Cases like `calc(100px * 180deg * 8px / 1em / 1turn)` now correctly resolve to a length with the correct conversions happening upon resolution.

- **Fixed:** The `Integer` CSS type now has a correct `type` of `"integer"`. ([#1625](https://github.com/Siteimprove/alfa/pull/1625))

## 0.82.0

### Minor Changes

- **Breaking:** Node 18 is no longer supported. ([#1618](https://github.com/Siteimprove/alfa/pull/1618))

## 0.81.0

### Patch Changes

- **Added:** Each package now contains its internal dependency graph in its `docs` directory. ([#1610](https://github.com/Siteimprove/alfa/pull/1610))

## 0.80.0

## 0.79.1

## 0.79.0

## 0.78.2

## 0.78.1

## 0.78.0

## 0.77.0

## 0.76.0

## 0.75.2

## 0.75.1

## 0.75.0

## 0.74.0

## 0.73.0

## 0.72.0

## 0.71.1

## 0.71.0

## 0.70.0

### Minor Changes

- **Breaking:** `Image.partiallyResolve()` and `Shape.partiallyResolve()` functions has been replaced by instance methods of the same name. ([#1510](https://github.com/Siteimprove/alfa/pull/1510))

- **Added:** `Function.parse` now also accepts a `Thunk` as body parser. ([#1508](https://github.com/Siteimprove/alfa/pull/1508))

  This notably allows to build recursive parsers by wrapping them in continuation.

### Patch Changes

- **Added:** all `Value` subtype now correctly implement the `(Partially)Resovable` interfaces. ([#1510](https://github.com/Siteimprove/alfa/pull/1510))

## 0.69.0

### Minor Changes

- **Added:** `Value` now expose a `partiallyResolve()` instance method. ([#1495](https://github.com/Siteimprove/alfa/pull/1495))

- **Breaking:** Various `Value.partiallyResolve()` functions have been removed. ([#1495](https://github.com/Siteimprove/alfa/pull/1495))

  Instead, use the corresponding `Value#partiallyResolve()` instance method.

- **Added:** `Percentage` can now be partially resolved into fixed `Percentage`. ([#1493](https://github.com/Siteimprove/alfa/pull/1493))

- **Breaking:** The various `Value.parseBase` functions are no more available. ([#1487](https://github.com/Siteimprove/alfa/pull/1487))

  These where temporary helpers during migration to calculated values.

  Use `filter(Value.parse, value => !value.hasCalculation(), () => "Calculation not allowed")` instead.

- **Breaking:** `Angle#resolve()` does not require a resolver anymore, since 100% is always 1 full turn. ([#1495](https://github.com/Siteimprove/alfa/pull/1495))

- **Added:** a `AnglePercentage.resolve()` helper is now available to handle `Percentage` shenanigans. ([#1493](https://github.com/Siteimprove/alfa/pull/1493))

- **Added:** `Percentage` builders now accept an optional type hint indicating into what the percentage resolves. ([#1493](https://github.com/Siteimprove/alfa/pull/1493))

- **Breaking:** CSS `Value` types no longer accept a `CALC` parameter; it is automatically inferred ([#1491](https://github.com/Siteimprove/alfa/pull/1491))

## 0.68.0

### Minor Changes

- **Added:** `Position` now accept calculations in any of their components. ([#1454](https://github.com/Siteimprove/alfa/pull/1454))

  To fully resolve a `Position`, the resolver needs both a length resolver, and two percentage bases, one for each dimension.
  To partially resolve a `Position`, only a length resolver is needed.

- **Breaking:** `Position.Component` cannot be raw `LengthPercentage` anymore. ([#1454](https://github.com/Siteimprove/alfa/pull/1454))

  Instead, they must always be a full `Position.Side` (or the "center" keyword) i.e. include an explicit side to count from. This side is automatically added when parsing raw `LengthPercentage`.

- **Added:** CSS `Shape` now accept calculated values ([#1478](https://github.com/Siteimprove/alfa/pull/1478))

  Shapes that accept length-percentage are only partially resolved at compute time.

- **Added:** CSS `Image` are now calculatable. ([#1477](https://github.com/Siteimprove/alfa/pull/1477))

  The components that accept `<length-percentage>` (e.g. elliptical radial gradients' radii) are only partially resolved at compute time and may thus still contain calculations.

- **Breaking:** `Gradient.Linear.parse`, `Gradient.Radial.parse`, and `Gradient.parse` now don't require an item list parser. ([#1477](https://github.com/Siteimprove/alfa/pull/1477))

- **Changed:** The `Position` type requires more type parameters. ([#1454](https://github.com/Siteimprove/alfa/pull/1454))

  Instead of just accepting the horizontal and vertical components, the type now also requires the horizontal and vertical keywords list (as first and second parameter). The components parameter default to `Position.Component<H>` (reps. `V`) for keywords `H` (resp. `V`).

- **Removed:** The unused `Side.isCenter()` predicate is no longer available. ([#1454](https://github.com/Siteimprove/alfa/pull/1454))

### Patch Changes

- **Added:** `Position.Side.of` now also accepts an optional offset, as well as an `Option<offset>`. ([#1454](https://github.com/Siteimprove/alfa/pull/1454))

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
