---
"@siteimprove/alfa-aria": patch
---

**Fixed:** Alfa now correctly handle spaces in accessible names. 

* `<br>` elements add a space to the name.
* text nodes with leading or trailing spaces (including space only nodes) keep the space when concatenated.
* Names of descendants with an `aria-label` are spaced, following browsers' behavior.
