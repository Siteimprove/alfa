---
"@siteimprove/alfa-rules": patch
---

**Fixed:** Issue where R75 would incorrectly flag some elements with invisible text

This was due to a change in the applicability of the rule which exposed some elements to being misidentified as having insufficient font size, even though they in fact had invisible text.
Other elements are in some cases also now passing where they would previously not be flagged by the rule, but this is not considered a bug.
