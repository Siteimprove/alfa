---
"@siteimprove/alfa-css": minor
---

**Breaking:** `Math.resolve` has been renamed `Math.resolve2`.
This is a temporary change to accommodate for the new `resolve` method on parent class `Value`.

**Breaking:** `Math.resolve2` now returns a `Result<Numeric, string>` instead of an `Option`.
Invalid expressions return an error message.

**Breaking:** No resolver is for needed `Math.resolve2` on `Number` expressions.
