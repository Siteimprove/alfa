---
"@siteimprove/alfa-aria": patch
---

**Fixed:** Name from content now correctly includes shadow DOM.

When the accessible name is computed from the descendants, slots and descendants inside a shadow DOM are correctly taken into account. This mimic what browsers are doing, and what the accessible name conputation group seems to be moving toward.
