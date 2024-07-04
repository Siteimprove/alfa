# @siteimprove/alfa-css-feature

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

### Minor Changes

- **Added:** User-preferences media queries are now supported. ([#1596](https://github.com/Siteimprove/alfa/pull/1596))

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

- **Added:** Simple feature query (`@supports` rules) are now supported. ([#1544](https://github.com/Siteimprove/alfa/pull/1544))

  Only the property testing is implemented (`@supports (foo: bar)`), not the function notations. Properties are considered supported if they do not start with `"-"` (i.e. they do not have a vendor prefix).

  Support feature testing is grouped int he `Feature.Supports` namespace.

## 0.71.1
