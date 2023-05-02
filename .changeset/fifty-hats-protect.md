---
"@siteimprove/alfa-dom": minor
---

**Added:** `hasTabIndex` now also accepts number values

`hasTabIndex` accepts numbers and will be satisfied if the tabindex is any of these numbers. It still alternatively accepts a `Predicate<number>`.
