---
"@siteimprove/alfa-selector": patch
---

**Fixed:** `Context.hover()`/`.active()`/`.focus()`/`.visit()` (the static factories) now return the same `Context` instance when called repeatedly for the same element, instead of constructing a fresh one every time. Since `alfa-cascade`/`alfa-style`'s caches are keyed by `Context` object identity, repeated queries for the same element under the same single-state context previously missed those caches on every call, even when nothing had actually changed.

This only pays off across *repeated* evaluations of the same `Document`/device (the cache is scoped to the page, not to one rule run) — e.g. `sia-r65` run a second time against an already-loaded page drops from ~131.4s to ~0.4s on a 10k-node fixture, with identical pass/fail outcomes before and after. A single, fresh evaluation (the normal case: each rule runs exactly once per page) sees no measurable change, since there is no prior pass to reuse. Kept as a correctness-neutral cache fix rather than a performance one.
