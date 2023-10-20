---
"@siteimprove/alfa-json": minor
---

**Added:** `Serializable` interface now optionally accepts serialization options.

When implementing the interface a type parameter can be supplied and `toJSON` can optionally take an object of that type that can be used for changing the serialization behavior.
