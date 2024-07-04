# @siteimprove/alfa-selective

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

### Minor Changes

- **Added:** `Selective#tee` is now available. ([#1625](https://github.com/Siteimprove/alfa/pull/1625))

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

### Minor Changes

- **Added:** A `#ifGuarded` method is now available. ([#1581](https://github.com/Siteimprove/alfa/pull/1581))

  This is useful for `Selective` that share part of the branch, to avoid re-doing potentially costly tests or building nested `Selective`. E.g., it can replace

  ```typescript
  Selective.of(x)
    .if(and(isFoo, isBar), fooBar)
    .if(isFoo /* and not(isBar) */, fooNotBar);
  ```

  with

  ```typescript
  Selective.of(x).ifGuarded(isFoo, isBar, fooBar, fooNotBar);
  ```

## 0.74.0

## 0.73.0

## 0.72.0

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

### Minor Changes

- **Added:** `Selective.if()` now accepts any refinement and will refine to the intersection of its result and the value in the associated right side. ([#1432](https://github.com/Siteimprove/alfa/pull/1432))

  This allows use cases like `Selective.of<A | B>(foo).if(isBOrC, bar => …)` to correctly refine `bar` to a `B` instead of defaulting to the `Predicate` overload that wouldn't refine anything.

## 0.63.3

## 0.63.2

## 0.63.1

## 0.63.0

## 0.62.2

## 0.62.1
