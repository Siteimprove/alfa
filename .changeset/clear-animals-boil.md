---
"@siteimprove/alfa-dom": patch
---

**Added:** `Native.fromNode()` now accepts an `injectDataAlfaId` option. If set, every element in the page will be updated by adding a `data-alfa-id` attribute whose value matches the `internalId` of the corresponding Alfa `Element`. This allows for easier matching of test targets with the original DOM element.
