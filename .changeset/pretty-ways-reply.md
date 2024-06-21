---
"@siteimprove/alfa-style": patch
---

**Changed:** Most properties now accept dimensions in calculations, when they cancel out.

For example, `color: rgb(calc(100% * 1px / 1em), 0, 0)` is now accepted.
