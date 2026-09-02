---
"@siteimprove/alfa-selector": patch
---

**Fixed:** `Context.hover()`/`.active()`/`.focus()`/`.visit()` (the static factories) now return the same `Context` instance when called repeatedly for the same element, instead of constructing a fresh one every time. Since `alfa-cascade`/`alfa-style`'s caches are keyed by `Context` object identity, repeated single-element-context queries (e.g. a rule checking many candidate elements' style under one target's `:focus` context) previously missed those caches on every call. Measured on `sia-r65` (which does exactly this): ~131.4s → ~0.4s on a 10k-node real-world page, with identical pass/fail outcomes before and after.
