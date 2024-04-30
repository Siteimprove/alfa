---
"@siteimprove/alfa-aria": patch
---

**Changed:** Role computation for `<li>` element now looks for a parent `<ul>` in the flat tree, not the DOM tree.

Browsers seem to behave differently on that case, but allowing slotted `<li>` makes sense, so taking this interpretation for now.
