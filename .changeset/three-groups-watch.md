---
"@siteimprove/alfa-selector": patch
---

**Changed:** The non-pseudo- selectors of a compound selector are now matched right to left.

This improves performances under the assumption that the most precise selectors are usually written last, thus increasing the probability of an early mismatch.
