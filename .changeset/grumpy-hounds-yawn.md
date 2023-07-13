---
"@siteimprove/alfa-dom": minor
---

**Added:** Support for optional `box` everywhere when constructing an `Element`.

Boxes are expected to be the result of `getBoundingClientRect`, i.e. contain adding and border.

It is up to the caller to ensure that the boxes were generated on the same `Device` that is used for audits. Alfa does not (and cannot) verify this.

Alfa assumes that the boxes where generated with an empty `Context`. It is up to the caller to ensure that this is the case.
