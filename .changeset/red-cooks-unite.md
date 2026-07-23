---
"@siteimprove/alfa-act": minor
---

**Breaking:** `Rule` is now a type alias (`Atomic | Composite`) rather than an exported abstract class.

The abstract base class is no longer re-exported, so `Rule` is no longer a class or constructor at runtime.
The `Rule` namespace object still exists (it carries `isRule`, `Atomic`, `Composite`, and `Event`), but code that
used `Rule` as a value, `instanceof Rule` checks, or subclassing the abstract base, must be updated to reference
`Rule.Atomic` or `Rule.Composite` directly, or use `Rule.isRule` in place of `instanceof`.
