---
"@siteimprove/alfa-act": minor
---

**Breaking:** `Rule` is now a type alias (`Atomic | Composite`) rather than an exported abstract class.

The base class is no longer re-exported from the package, so `Rule` is no longer a runtime binding.
Code that used `Rule` as a value, `instanceof Rule` checks, or subclassing the abstract base, must be updated
to reference `Rule.Atomic` or `Rule.Composite` directly.
