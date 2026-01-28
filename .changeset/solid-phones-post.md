---
"@siteimprove/alfa-css": minor
---

**Added:** `Color.resolve` and `Color.partiallyResolve` helpers are now available, with the former requiring a resolver to provide a value for `currentColor`.

Since the `Color` type is just a union and not a subclass of `Value`, there is no `Color#resolve` method.
