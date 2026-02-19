# @siteimprove/alfa-style

## 0.111.0

## 0.110.0

### Minor Changes

- **Breaking:** Used values of style properties can now be any type, wrapped in a value, not just an `Option` of the computed type. The `Style.hasUsedValue` predicate now requires as argument a predicate of the used value type (instead of the computed one). ([#1982](https://github.com/Siteimprove/alfa/pull/1982))

  For properties who previously had a used value (typed as `Option<Value<Computed>>`), the new used type is now `Option<Computed>` and the `.used` function returns a `Value<Option<Computed>>`. Hence, to access the actual value, replace `style.used("foo").map(foo => doSomething(foo.value))` with `style.used("foo").value.map(foo => doSomething(foo))`, and similar permutations.

### Patch Changes

- **Fixed:** CSS properties whose value is a color now properly resolve system colors at compute time; and `currentColor` at used time. ([#1982](https://github.com/Siteimprove/alfa/pull/1982))

- **Added:** The `inert` attribute is now supported. ([#1964](https://github.com/Siteimprove/alfa/pull/1964))

## 0.109.0

### Patch Changes

- **Added:** CSS properties `max-width` and `max-height` are now supported. ([#1960](https://github.com/Siteimprove/alfa/pull/1960))

## 0.108.2

## 0.108.1

## 0.108.0

## 0.107.0

## 0.106.1

## 0.106.0

## 0.105.0

### Patch Changes

- **Added:** Test coverage data is now included in all packages, as well as at global level. ([#1878](https://github.com/Siteimprove/alfa/pull/1878))

## 0.104.1

## 0.104.0

## 0.103.3

## 0.103.2

## 0.103.1

## 0.103.0

### Minor Changes

- **Added:** A `Style.hasSoftWrapOpportunity` predicate is now available. ([#1784](https://github.com/Siteimprove/alfa/pull/1784))

## 0.102.0

## 0.101.0

## 0.100.1

## 0.100.0

### Minor Changes

- **Breaking:** The `white-space` property is now handled as a shorthand. ([#1762](https://github.com/Siteimprove/alfa/pull/1762))

  Declarations should still be backward compatible. However, querying the value must now be done through the longhands `white-space-collapse`, `text-wrap-mode` or `white-space-trim`.

- **Added:** Legacy name alias properties are now supported. ([#1762](https://github.com/Siteimprove/alfa/pull/1762))

- **Added:** Properties `hyphens`, `line-break`, `overflow-wrap`, `text-wrap`, `text-wrap-mode`, `text-wrap-style`, `white-space-collapse`, `white-space-trim`, `wrap-after`, `wrap-before`, `wrap-inside`, `word-break`, and `word-wrap` are now supported. ([#1762](https://github.com/Siteimprove/alfa/pull/1762))

## 0.99.0

### Minor Changes

- **Added:** A new predicate `isFlexOrGridChild` is available. ([#1756](https://github.com/Siteimprove/alfa/pull/1756))

## 0.98.0

### Patch Changes

- **Changed:** Classes that do not implement the Singleton pattern now have `protected` constructor and can be extended. ([#1735](https://github.com/Siteimprove/alfa/pull/1735))

## 0.97.0

### Minor Changes

- **Added:** CSS shorthand property `mask` and corresponding longhand properties are now supported. ([#1711](https://github.com/Siteimprove/alfa/pull/1711))

## 0.96.0

## 0.95.0

## 0.94.1

## 0.94.0

### Minor Changes

- **Added:** CSS property `will-change` is now supported. ([#1707](https://github.com/Siteimprove/alfa/pull/1707))

- **Added:** A `Style.innerText` helper is now available. ([#1712](https://github.com/Siteimprove/alfa/pull/1712))

- **Added:** CSS property `perspective` is now supported. ([#1708](https://github.com/Siteimprove/alfa/pull/1708))

## 0.93.8

## 0.93.7

## 0.93.6

## 0.93.5

## 0.93.4

## 0.93.3

## 0.93.2

### Patch Changes

- **Fixed:** Resolution of chained CSS variables has been improved. ([#1697](https://github.com/Siteimprove/alfa/pull/1697))

  In some cases of chained CSS variables, substitutions did not happen all the way through, resulting in partially resolved variables; this has been fixed.

## 0.93.1

### Patch Changes

- **Fixed:** Mono-line `<select>` are again correctly considered as visible. ([#1696](https://github.com/Siteimprove/alfa/pull/1696))

## 0.93.0

### Minor Changes

- **Added:** Support for CSS properties `scale` and `translate` was added. ([#1688](https://github.com/Siteimprove/alfa/pull/1688))

- **Added:** A `Style.hasUsedStyle` predicate builder is now available. ([#1694](https://github.com/Siteimprove/alfa/pull/1694))

- **Added:** Style properties `container-type`, `mix-blend-mode` and `isolation` are now supported. ([#1675](https://github.com/Siteimprove/alfa/pull/1675))

- **Added:** Style property `contain` is now supported. ([#1679](https://github.com/Siteimprove/alfa/pull/1679))

- **Fixed:** `flex-wrap` now has a used value of `None` on elements that are not flex containers. ([#1694](https://github.com/Siteimprove/alfa/pull/1694))

- **Added:** `Style` objects now have an optional `owner` pointing to the element whose style it is. ([#1694](https://github.com/Siteimprove/alfa/pull/1694))

- **Added:** Basic support for used values is now available. ([#1689](https://github.com/Siteimprove/alfa/pull/1689))

  This mostly supports no values for elements where the property does not apply.

### Patch Changes

- **Fixed:** `<option>` elements that are hidden by their `<select>` are now correctly considered as invisible. ([#1683](https://github.com/Siteimprove/alfa/pull/1683))

- **Fixed:** `overflow` and `text-overflow` now have no used value on elements where they don't apply. ([#1689](https://github.com/Siteimprove/alfa/pull/1689))

- **Fixed:** The computed value of `display` for `<button>` elements now correctly handles button layout. ([#1694](https://github.com/Siteimprove/alfa/pull/1694))

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

- **Added:** Style property `z-index` has been added. ([#1660](https://github.com/Siteimprove/alfa/pull/1660))

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

## 0.87.3

## 0.87.2

## 0.87.1

## 0.87.0

### Minor Changes

- **Added:** Predicate `isScrolledBehind` for checking if a node is scrolled behind an ancestor has been added. ([#1651](https://github.com/Siteimprove/alfa/pull/1651))

- **Breaking:** Optional serialization type parameters have been removed. ([#1651](https://github.com/Siteimprove/alfa/pull/1651))

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

- **Changed:** Most properties now accept dimensions in calculations, when they cancel out. ([#1625](https://github.com/Siteimprove/alfa/pull/1625))

  For example, `color: rgb(calc(100% * 1px / 1em), 0, 0)` is now accepted.

## 0.82.0

### Minor Changes

- **Breaking:** Node 18 is no longer supported. ([#1618](https://github.com/Siteimprove/alfa/pull/1618))

## 0.81.0

### Patch Changes

- **Added:** Each package now contains its internal dependency graph in its `docs` directory. ([#1610](https://github.com/Siteimprove/alfa/pull/1610))

## 0.80.0

## 0.79.1

## 0.79.0

### Minor Changes

- **Added:** The `revert` global keyword is now handled. ([#1604](https://github.com/Siteimprove/alfa/pull/1604))

- **Breaking:** `Style.of` now requires the `Declaration` to be paired with their `Origin`. ([#1604](https://github.com/Siteimprove/alfa/pull/1604))

  As always with it, prefer using `Style.from` when possible as it has fewer assumptions.

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

### Minor Changes

- **Added:** New property `pointer-events`. ([#1564](https://github.com/Siteimprove/alfa/pull/1564))

## 0.72.0

## 0.71.1

## 0.71.0

## 0.70.0

## 0.69.0

### Minor Changes

- **Breaking:** The `hasInlineStyleProperty` and `hasCascadedValueDeclaredInInlineStyleOf` predicates have been removed. ([#1499](https://github.com/Siteimprove/alfa/pull/1499))

  These predicate were deprecated for a year, and the (deprecated) rules using them have already been removed.

## 0.68.0

### Minor Changes

- **Breaking:** Function `getBoundingBox` was removed. ([#1474](https://github.com/Siteimprove/alfa/pull/1474))

  Use `Element#getBoundingBox` instead.

- **Added:** CSS `Shape` now accept calculated values ([#1478](https://github.com/Siteimprove/alfa/pull/1478))

  Shapes that accept length-percentage are only partially resolved at compute time.

- **Added:** CSS `Image` are now calculatable. ([#1477](https://github.com/Siteimprove/alfa/pull/1477))

  The components that accept `<length-percentage>` (e.g. elliptical radial gradients' radii) are only partially resolved at compute time and may thus still contain calculations.

### Patch Changes

- **Fixed:** `<img>` elements are now considered as respecting their specified dimensions ([#1485](https://github.com/Siteimprove/alfa/pull/1485))

  `<img>` elements whose `width` or `height` is specified are now considered to respect it when computing their concrete dimensions (i.e., they rescale rather than overflow, independently from the `overflow` property).

  This is especially meaningful for tracking pixels with specified dimensions of 0 that are now correctly considered as invisible.

## 0.67.0

### Minor Changes

- **Added:** A function for getting the bounding box of an element given a device. ([#1464](https://github.com/Siteimprove/alfa/pull/1464))

  This should be the only way of accessing an elements bounding box and prepares us for having device dependent boxes.

## 0.66.0

### Minor Changes

- **Breaking:** The `is-visible-shadow` predicate can now only be applied to canonical shadows (i.e. computed values of properties using `Shadow`). ([#1455](https://github.com/Siteimprove/alfa/pull/1455))

## 0.65.1

## 0.65.0

### Minor Changes

- **Changed:** `isVisible` now considers layout information. ([#1450](https://github.com/Siteimprove/alfa/pull/1450))

  When checking if an element is off-screen, clipped to size 0, or positioned out of a clipping ancestor, Alfa now uses layout information (Element's boxes) when available.

  This should improve the accuracy of `isVisible` in several corner cases, notably content that is moved just out of the screen, since the current heuristics wants at least a `9999px` offset to be on the safe side.

- **Removed:** Many pieces of code are no longer exported. These were mostly internal exports that are no longer used in other files and should not impact intended usage of the packages. ([#1437](https://github.com/Siteimprove/alfa/pull/1437))

- **Added:** CSS colors now accept calculated values. ([#1448](https://github.com/Siteimprove/alfa/pull/1448))

  CSS colors in RGB and HSL format now accept calculations as any of their components. Style properties that use colors have been updated accordingly.

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
