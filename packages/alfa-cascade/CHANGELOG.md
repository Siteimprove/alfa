# @siteimprove/alfa-cascade

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
