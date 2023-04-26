---
"@siteimprove/alfa-option": minor
---

**Breaking:** Moved `Maybe` type out of `Option` namespace

The type was moved while adding the function `Maybe.toOption`. The type is an internal convenience type that is only used when it's not possible or practical to use `Option`. To migrate, import `Maybe` from the `alfa-option` package and replace `Option.Maybe` with `Maybe`.
