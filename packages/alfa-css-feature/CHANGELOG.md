# @siteimprove/alfa-css-feature

## 0.76.0

## 0.75.2

## 0.75.1

## 0.75.0

## 0.74.0

## 0.73.0

## 0.72.0

### Minor Changes

- **Breaking:** `@siteimprove/alfa-media` has been deprecated and replaced by `@siteimprove/alfa-css-feature`. ([#1544](https://github.com/Siteimprove/alfa/pull/1544))

  In the newer package, the exported namespace is called `Feature` (instead of `Media`), with a `Feature.Media` sub-namespace. This reverses the previous `Media.Feature` naming and corresponds better to the CSS naming. Similarly, `Query`, `List`, `Type`, and `Modifier` are now under the `Feature.Media` namespace. `Condition` is under the `Feature` namespace as it can apply to other kind of features. The media features per se, previously under `Media.Feature` are thus now under `Feature.Media.Feature`.

  Additionally, `Media.parse` (now `Feature.Media.parse`) is directly available as `Feature.parseMediaQuery`.

- **Added:** Simple feature query (`@supports` rules) are now supported. ([#1544](https://github.com/Siteimprove/alfa/pull/1544))

  Only the property testing is implemented (`@supports (foo: bar)`), not the function notations. Properties are considered supported if they do not start with `"-"` (i.e. they do not have a vendor prefix).

  Support feature testing is grouped int he `Feature.Supports` namespace.

## 0.71.1
