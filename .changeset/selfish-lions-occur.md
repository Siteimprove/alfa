---
"@siteimprove/alfa-css": minor
---

**Breaking:** `Value` now require a `resolve` method.
This method resolves calculation into actual values.

**Added:** `Value` type now accepts a second boolean type parameter indicating whether the value may or not contain unresolved calculation.
This parameter defaults to `false`. Its value is also available via the `Value#hasCalculation()` type predicate.
