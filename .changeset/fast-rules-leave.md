---
"@siteimprove/alfa-cascade": minor
---

**Breaking:** `SelectorMap.#get` now requires an `AncestorFilter` rather than an `Option<AncestorFilter>`.

All actual use cases in the code are now passing an ancestor filter, so there is no need to wrap it as an option anymore.
