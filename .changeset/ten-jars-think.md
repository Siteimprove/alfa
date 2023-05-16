---
"@siteimprove/alfa-result": minor
---

**Breaking:** Removed `Err#get` and `Ok#getErr` and added `Result#getUnsafe` and `Result#getErrUnsafe`

Going forward it will only be possible to call `.get` on `Ok` instances and `.getErr` on `Err` instances. As a quick migration replace every occurrence of `foo.get()` that results in compile error with `foo.getUnsafe()` and similarly `foo.getErr()` with `foo.getErrUnsafe()`. It is intended that these two methods are only called when an external proof of correctness (out of the type system) exists, typically in tests or with some more complex interactions. It is advised to document these usage with such a proof.
