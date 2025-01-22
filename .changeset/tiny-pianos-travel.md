---
"@siteimprove/alfa-result": minor
---

**Added:** `Result#getOrElse` now accepts a `Callback(E, U)` (building the new value from the error); `Result#getErrOrElse` now accepts a `Callback(T, F)`.
