---
"@siteimprove/alfa-option": minor
---

**Added:** An `Option.getter` method is now available, returning an option of the value associated with the key in the original object.

That is, `option.getter("foo")` is the same as `option.map(value => value.foo)`.
