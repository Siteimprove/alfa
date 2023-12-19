# @siteimprove/alfa-cascade

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
