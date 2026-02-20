---
"@siteimprove/alfa-lazy": patch
---

**Fixed:** `Lazy` whose underlying `Thunk` is stateful now correctly freeze their value upon evaluation, even across copies (e.g. mapped version of the `Lazy`).
