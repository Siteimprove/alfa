# @siteimprove/alfa-tree

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

- **Added:** Verbosity option has been added to JSON serialization of alfa-tree `Node` and to `Outcome` and `Group`. ([#1618](https://github.com/Siteimprove/alfa/pull/1618))

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

## 0.69.0

### Minor Changes

- **Added:** Tree `Node`, and DOM `Node` can now have an `externalId` (`string`) and some `extraData` (`any`). ([#1498](https://github.com/Siteimprove/alfa/pull/1498))

  These are intended for callers that need to record some extra data during audits and retrieve it afterward. Especially, the `externalId` is intended for callers who already have an identifier for nodes and do not want to lose it during audits, nor maintain a map between these identifiers and Alfa nodes.

  Alfa is guaranteed to never interact with the `extraData` in any way; except that it will be typed as `any`, so any type guard or assertions must be re-applied afterward.

  Alfa may, in the future, decide that `Node` with the same `externalId` can be identified in some way, e.g., because they represent two versions of the same object that were turned into two different Alfa object. This can for example happen when two copies of the same page in different states (e.g., different tab opened) are audited; this creates two Alfa `Document`, but the external caller may have the extra knowledge that some of the nodes should be identified.

  It is up to the callers to ensure that the `externalId` are unique, since they are meant to carry knowledge that Alfa cannot infer.

  The `externalId`, if any, is included in the serialisation of nodes. The `extraData` is never included because Alfa does not ensure it is serializable (it may contain circular references, …)

  `extraData` can only be provided when building DOM nodes with the `#of` methods, or the `h.*` functions. `externalId` for `Element` can also be provided by a key with the same name in the JSX syntax.

## 0.68.0

### Minor Changes

- **Added:** Optional serialization options type parameter added to abstract `Node` class. ([#1474](https://github.com/Siteimprove/alfa/pull/1474))

  This is passed to the `Serializable` interface to allow implementers to supply the serialization options type.

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
