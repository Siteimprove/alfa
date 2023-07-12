---
"@siteimprove/alfa-style": minor
---

**Changed:** `isVisible` now considers layout information.

When checking if an element is off-screen, clipped to size 0, or positioned out of a clipping ancestor, Alfa now uses layout information (Element's boxes) when available.

This should improve the accuracy of `isVisible` in several corner cases, notably content that is moved just out of the screen, since the current heuristics wanted at least a `9999px` move to be on the safe side.
