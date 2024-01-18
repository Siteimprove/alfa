---
"@siteimprove/alfa-cascade": minor
---

**Added:** `Cascade` now handles declarations from encapsulated context (shadow DOM).

CSS selectors and rules that are affecting the host tree are now stored separately and retrieved when computing the cascade of said host.

As with other rules from style sheet, these are only effective when the shadow host is part of a tree. Otherwise, only the `style` attribute is taken into consideration.
