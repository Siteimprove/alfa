---
"@siteimprove/alfa-dom": minor
---

**Breaking:** The `Slotable` interface is now an intermediate abstract class between `Node` and `element`/`Text`. The `Slotable.foo` functions are now `Slotable#foo` methods; The `Slotable.findSlot` function/method has been removed as it is just an alias for `Slotable#assignedSlot`.
