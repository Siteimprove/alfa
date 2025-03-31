---
"@siteimprove/alfa-dom": patch
---

**Fixed:** `Native.fromNode` can now handle `document.adoptedStyleSheets` where `length` property is missing.

This addresses what is probably incorrect behavior of the `adoptedStyleSheets` in some browser implementations.
