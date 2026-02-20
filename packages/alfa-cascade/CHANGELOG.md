# @siteimprove/alfa-cascade

## 0.111.0

## 0.110.0

## 0.109.0

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

## 0.102.0

### Patch Changes

- **Fixed:** The user agent sheet now includes `details` and `summary`. ([#1777](https://github.com/Siteimprove/alfa/pull/1777))

  This fixes the visibility behavior of the content after the `<summary>` element, when the `<details>` is closed.

## 0.101.0

## 0.100.1

## 0.100.0

## 0.99.0

## 0.98.0

### Patch Changes

- **Changed:** Classes that do not implement the Singleton pattern now have `protected` constructor and can be extended. ([#1735](https://github.com/Siteimprove/alfa/pull/1735))

## 0.97.0

## 0.96.0

## 0.95.0

## 0.94.1

## 0.94.0

## 0.93.8

## 0.93.7

## 0.93.6

## 0.93.5

## 0.93.4

## 0.93.3

## 0.93.2

### Patch Changes

- **Fixed:** The User-Agent style shet now sets `<select>` elements to `display: inline-block`, matching rendering recommendations. ([#1699](https://github.com/Siteimprove/alfa/pull/1699))

## 0.93.1

## 0.93.0

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

### Minor Changes

- **Added:** CSS `import` rules now support `layer`, and `supports` condition. ([#1603](https://github.com/Siteimprove/alfa/pull/1603))

## 0.78.2

## 0.78.1

## 0.78.0

## 0.77.0

## 0.76.0

## 0.75.2

### Patch Changes

- **Fixed:** `!important` declarations in rules with normal declarations are not dropped anymore. ([#1585](https://github.com/Siteimprove/alfa/pull/1585))

  While moving handling of `!important` from `alfa-style` to `alfa-cascade`, a regression was introduced that effectively dropped `!important` declarations from rules having both normal and important ones (e.g. `div {color: blue; background: red !important }`); this is now fixed.

- **Added:** An `isImportant` predicate is available on `Origin` and `Precedence`. ([#1585](https://github.com/Siteimprove/alfa/pull/1585))

## 0.75.1

## 0.75.0

### Minor Changes

- **Added:** CSS `@layer` rules are now handled when building cascades. ([#1574](https://github.com/Siteimprove/alfa/pull/1574))

### Patch Changes

- **Fixed:** `::slotted` selectors within a compound selector are now correctly handled. ([#1575](https://github.com/Siteimprove/alfa/pull/1575))

## 0.74.0

## 0.73.0

### Minor Changes

- **Added:** `Cascade` now handles declarations from encapsulated contexts (shadow DOM). ([#1553](https://github.com/Siteimprove/alfa/pull/1553))

  CSS selectors and rules that are affecting the host tree are now stored separately and retrieved when computing the cascade of said host.

  As with other rules from style sheets, these are only effective when the shadow host is part of a document tree. Otherwise, only the `style` attribute is taken into consideration.

- **Added:** Cascade now handle importance of declarations, and `style` attribute. ([#1550](https://github.com/Siteimprove/alfa/pull/1550))

  This should have no impact on regular usage of `Style.from()` but may affect code trying to use the cascade directly.
  Most notably, the internal rule tree `Block` can now come either from a rule or an element. Therefore, `Block.rule` and `Block.selector` may now be `null`.

- **Added:** The `:host` and `:host-context` pseudo-classes, as well as the `::slotted` pseudo-element are now supported. ([#1554](https://github.com/Siteimprove/alfa/pull/1554))

## 0.72.0

### Minor Changes

- **Breaking:** `SelectorMap.#get` now requires an `AncestorFilter` rather than an `Option<AncestorFilter>`. ([#1540](https://github.com/Siteimprove/alfa/pull/1540))

  All actual use cases in the code are now passing an ancestor filter, so there is no need to wrap it as an option anymore.

- **Breaking:** `Cascade.of` has been renamed `Cascade.from`. ([#1540](https://github.com/Siteimprove/alfa/pull/1540))

  This matches better naming conventions in other packages, since it does perform some heavy computation before building the cascade.

- **Removed:** `AncestorFilter#match` has been made internal. ([#1540](https://github.com/Siteimprove/alfa/pull/1540))

  Use `!AncestorFilter.canReject` instead, which is having fewer assumptions.

- **Breaking:** Data in Rule tree nodes is now wrapped in a `Block` object that need to be opened. ([#1540](https://github.com/Siteimprove/alfa/pull/1540))

  That is, replace, e.g., `node.declarations` with `node.block.declarations` to access the declarations associated to a node in the rule tree, and so forth for other data.

- **Added:** Functionalities for dealing with Cascade Sorting Order (origin, specificity, order) are now grouped in a `Precedence` interface. ([#1540](https://github.com/Siteimprove/alfa/pull/1540))

- **Added:** Simple feature query (`@supports` rules) are now supported. ([#1544](https://github.com/Siteimprove/alfa/pull/1544))

  Only the property testing is implemented (`@supports (foo: bar)`), not the function notations. Properties are considered supported if they do not start with `"-"` (i.e. they do not have a vendor prefix).

  Support feature testing is grouped int he `Feature.Supports` namespace.

## 0.71.1

## 0.71.0

### Minor Changes

- **Breaking:** `RuleTree.add` and `RuleTree.Node.add` have been made internal. ([#1534](https://github.com/Siteimprove/alfa/pull/1534))

  These have heavy assumptions on arguments in order to build a correct rule tree and are not intended for external use. Use `Cascade.of` to build correct cascade and rule trees.

  In addition, `RuleTree.Node.add` has been moved to an instance method, and its arguments have been simplified.

- **Breaking:** `Cascade.get()` now returns a `RuleTree.Node` instead of an `Option`. ([#1534](https://github.com/Siteimprove/alfa/pull/1534))

  `RuleTree` now have a fake root with no declarations, if no rule matches the current element, `Cascade.get(element)` will return that fake root.

## 0.70.0

## 0.69.0

## 0.68.0

### Patch Changes

- **Changed:** `<button>`'s `background-color` now defaults to `buttonface`. ([#1472](https://github.com/Siteimprove/alfa/pull/1472))

  `<button>` elements default `background-color` is somewhat different between user-agents. Rather than picking one, we use the system `buttonface` color instead. This notably opens way to handle it with a branched value, possibly also detecting whether we are in forced colors mode.

## 0.67.0

## 0.66.0

## 0.65.1

## 0.65.0

### Minor Changes

- **Removed:** Many pieces of code are no longer exported. These were mostly internal exports that are no longer used in other files and should not impact intended usage of the packages. ([#1437](https://github.com/Siteimprove/alfa/pull/1437))

## 0.64.0

## 0.63.3

## 0.63.2

## 0.63.1

## 0.63.0

## 0.62.2

## 0.62.1
