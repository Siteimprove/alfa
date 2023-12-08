---
"@siteimprove/alfa-selector": minor
---

**Breaking:** `Compound` selectors are now built on top of Iterable, rather than re-inventing chained lists.

That is, `Compound#left` and `Compound#right` are no more available, but `Compound#selectors` replaces them.
