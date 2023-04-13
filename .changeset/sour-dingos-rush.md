---
"@siteimprove/alfa-selector": minor
"@siteimprove/alfa-result": minor
"@siteimprove/alfa-media": minor
"@siteimprove/alfa-rules": minor
"@siteimprove/alfa-style": minor
"@siteimprove/alfa-xpath": minor
"@siteimprove/alfa-http": minor
"@siteimprove/alfa-iana": minor
"@siteimprove/alfa-act": minor
"@siteimprove/alfa-css": minor
"@siteimprove/alfa-url": minor
"@siteimprove/alfa-web": minor
---

- Removed `Err#get` and `Result#getErr`
- Added `Result#getUnsafe`
- Changed `Request#from`, `Response#from` and `Page#from` to return `Result<...>`.
  This is a breaking change.
  Before the change they were unsafely unwrapping the result of parsing an URL which would result in a runtime exception if the URL was invalid.
  After the change an `Err` with the message `Invalid URL` will instead be returned.
  This means callers using these functions will need to make changes, but they can choose to call `.getUnsafe()` on the value returned, to retain the old behavior (where an exception might be thrown) or they can add error handling logic.
