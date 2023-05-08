---
"@siteimprove/alfa-css": minor
---

**Breaking:** `Math.resolve` now returns a `Result<Numeric2, string>` instead of an `Option`.
Invalid experssions return an error message.

**Breaking:** No resolver is needed `Math.resolve` on `Number2` expressions.
