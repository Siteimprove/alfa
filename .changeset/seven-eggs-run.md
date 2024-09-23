---
"@siteimprove/alfa-dom": minor
---

**Breaking:** The helper `Element.inputType(element)` has been replaced by a method `element.inputType()`.

It can still only be called if `element` has been typed as `Element<"input">`, i.e. is an `<input>` HTML element.
