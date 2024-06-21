---
"@siteimprove/alfa-css": patch
---

**Fixed:** Calculations containing products and divisions of dimensions are better handled.

Cases like `calc(100px * 180deg * 8px / 1em / 1turn)` now correctly resolve to a length with the correct conversions happening upon resolution.
