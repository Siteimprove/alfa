---
"@siteimprove/alfa-dom": minor
---

**Breaking:** The `hasBox` predicate has been moved from `Element` to `Node`.

To migrate, replace `Element.hasBox` with `Node.hasBox`.
If `Node` is not imported, add it to the import statement:
```
import { Element, Node } from "@siteimprove/alfa-dom";
```
