---
"@siteimprove/alfa-dom": minor
---

**Breaking:** `hasUniqueId` is now directly a `Predicate`

It used to a be `() => Predicate`, the useless void parameter has now been removed. To migrate, simply replace any call to `hasUniqueId()` by `hasUniqueId` (remove the useless empty parameter).
