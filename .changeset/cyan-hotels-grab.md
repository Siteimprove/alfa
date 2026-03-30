---
"@siteimprove/alfa-dom": minor
---

**Added:** Style rule subclasses now export their factory functions and type guards directly from the `Rule` namespace, e.g. use `Rule.media` (resp. `Rule.isMediaRule`) as an alias for `Rule.Media.of` (resp. `Rule.Media.isMediaRule`).
