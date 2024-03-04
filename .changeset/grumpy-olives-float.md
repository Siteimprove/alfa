---
"@siteimprove/alfa-cascade": patch
---

**Fixed:** `!important` declarations in rules with normal declarations are not dropped anymore.

While moving handling of `!important` from `alfa-style` to `alfa-cascade`, a regression was introduced that effectively dropped `!important` declarations from rules having both normal and important ones (e.g. `div {color: blue; background: red !important }`); this is now fixed.
