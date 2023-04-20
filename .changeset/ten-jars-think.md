---
"@siteimprove/alfa-result": minor
---

Removed `Err#get` and `Ok#getErr` and added `Result#getUnsafe` and `Result#getErrUnsafe`. Going forward it will only be possible to call `.get` on an instance known to be `Ok` at compile time and dually `.getErr` on an instance known to be `Err`. As a quick migration replace every occurence of `foo.get()` that results in compile error with `foo.getUnsafe()` and similarly `foo.getErr()` with `foo.getErrUnsafe()`.
