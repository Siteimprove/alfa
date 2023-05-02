---
"@siteimprove/alfa-css": minor
---

**Breaking:** `Math.resolve` now returns a `Result<Numeric, string>` instead of an `Option`.
Invalid experssions return an error message.

**Breaking:** No resolver is needed `Math.resolve` on `Number` expressions.
