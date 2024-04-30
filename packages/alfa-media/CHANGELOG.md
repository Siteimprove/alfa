# @siteimprove/alfa-media

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

### Minor Changes

- **Breaking:** `@siteimprove/alfa-media` has been deprecated and replaced by `@siteimprove/alfa-css-feature`. ([#1544](https://github.com/Siteimprove/alfa/pull/1544))

  In the newer package, the exported namespace is called `Feature` (instead of `Media`), with a `Feature.Media` sub-namespace. This reverses the previous `Media.Feature` naming and corresponds better to the CSS naming. Similarly, `Query`, `List`, `Type`, and `Modifier` are now under the `Feature.Media` namespace. `Condition` is under the `Feature` namespace as it can apply to other kind of features. The media features per se, previously under `Media.Feature` are thus now under `Feature.Media.Feature`.

  Additionally, `Media.parse` (now `Feature.Media.parse`) is directly available as `Feature.parseMediaQuery`.

## 0.71.1

## 0.71.0

## 0.70.0

## 0.69.0

## 0.68.0

## 0.67.0

## 0.66.0

## 0.65.1

## 0.65.0

## 0.64.0

## 0.63.3

## 0.63.2

## 0.63.1

## 0.63.0

## 0.62.2

## 0.62.1
