---
"@siteimprove/alfa-cascade": patch
---

**Changed:** Cascade selector matching is now delegated to a Rust/WASM engine (built on Servo's `selectors` crate) for selectors it can parse, falling back to the existing TypeScript matcher otherwise (currently: any selector using a Context-dependent pseudo-class such as `:hover` or `:focus-within`). This is an internal change with no public API impact.
