---
"@siteimprove/alfa-dom": minor
---

**Breaking:** `hasUniqueId` is now directly a `Predicate`

It used to a be `() => Predicate`, the useless void argument has now been removed.
