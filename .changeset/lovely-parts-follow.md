---
"@siteimprove/alfa-dom": minor
---

**Breaking:** The `Slot` interface is now just a type alias for `Element<"slot">`. The `Slot.foo` functions are now `Slot#foo` methods; The `Slot.findSlottable` function/method has been removed as it is just an alias for `Slot#assignedNodes`.
