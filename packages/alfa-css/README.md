# Package `@siteimprove/alfa-css`

## Description

This package implements support for CSS syntax and values.

## Package organisation

(all paths are relative to `src/`)

* `syntax`: Support for the CSS syntax and parsers for the basic tokens.
* `unit`: Model of CSS units. We currently only support `angle` and `length`.
* `calculation`: Model of CSS calculations. This contains base (non calculated) numeric types, and calculations themselves.
* `value`: Model for the CSS values themselves. This includes another copy of the numeric types, but this time including potential calculation. Most of the actual work is likely to involve this directory. It is further split into the various types.

## Value structure

The [`Value` type](./src/value/value.ts) contains the shared structure of CSS values. Most notably:

* `Value` have a `type` string parameter that can be used as a discriminating union field (e.g. in a `switch` statement). However, it may sometimes be more convenient to use the `Foo.isFoo` type predicates, notably in combination with a [`Selective` construct](../alfa-selective).
* `Value` have a `CALC` type parameter that indicates whether they may contain calculations (i.e. if `CALC` is `false`, we guarantee there is no calculation, but if `CALC` is `true`, we do not guarantee the presence of a calculation). This parameter can be accessed programmatically with the `Value#hasCalculation()` type predicate.
* `Value` have a `Foo.Canonical` subtype representing the canonical form of the value. This includes resolving calculations, converting units to their canonical units (e.g. `px` for lengths), and otherwise converting formats (e.g. canonical colors are in RGB format).
* `Value` have a `#resolve()` method to resolve calculations and provide the same `value` in its canonical form. These may need a resolver to help with some types (mostly lengths and percentages). The type system should ensure that `#resolve()` is always called with the correct resolver. `Value` that need a resolver also have a `Foo.Resolver` type to declare it.
* For many `Value`, percentage resolution depends on data Alfa does not always have (usually, size of boxes). These also have a `Foo.PartiallyResolved` type, and a `Foo.partiallyResolve()` function (with its `Foo.PartialResolver` interface). Note that partially resolved values will possibly include calculations, including mixed ones (`length-percentage`) and that needs to be handled downstream (e.g. with the computed values of the CSS properties using these).
* `Value` implement the `Resolvable` interface, which state into what they resolve, and which resolver they need.
