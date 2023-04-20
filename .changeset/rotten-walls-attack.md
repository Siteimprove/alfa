---
"@siteimprove/alfa-web": minor
---

Changed `Request#from`, `Response#from` and `Page#from` to return `Result<...>` to reflect the fact that the function might fail on invalid input. As a quick migration add a `.getUnsafe()` call to the returned result which will retain the original behavior where an exception might be thrown.
