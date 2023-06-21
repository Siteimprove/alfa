---
"@siteimprove/alfa-css": minor
---

**Breaking:** `Math.resolve` now returns a `Result<Numeric, string>` instead of an `Option`.
Invalid expressions return an error message.

**Breaking:** No resolver is needed for `Math.resolve` on `Number` expressions.

**Breaking:** Math expression converters (`.toLength`, …) now return a `Result<T, string>` instead of an `option<T>`.
