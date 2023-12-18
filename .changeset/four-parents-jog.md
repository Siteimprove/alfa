---
"@siteimprove/alfa-cascade": minor
---

**Breaking:** `RuleTree.add` and `RuleTree.Node.add` have been made internal.

These have heavy assumptions on arguments in order to build a correct rule tree and are not intended for external use. Use `Cascade.of` to build correct cascade and rule trees.

In addition, `RuleTree.Node.add` has been moved to an instance method, and its arguments have been simplified.
