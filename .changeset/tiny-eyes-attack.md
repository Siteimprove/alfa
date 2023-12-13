---
"@siteimprove/alfa-cascade": minor
---

**Breaking:** `Cascade.get()` now returns a `RuleTree.Node` instead of an `Option`.

`RuleTree` now have a fake root with no declarations, if no rule matches the current element, `Cascade.get(element)` will return that fake root.
