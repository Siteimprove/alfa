---
"@siteimprove/alfa-selector": minor
---

**Breaking:** `List` selectors are now built on top of Iterable, rather than re-inventing chained lists.

That is, `List#left` and List#right`are no more available, but`List.selectors` replaces them.
