---
"@siteimprove/alfa-cascade": minor
---

**Breaking:** Data in Rule tree nodes is now wrapped in a `Block` object that need to be opened.

That is, replace, e.g., `node.declarations` with `node.block.declarations` to access the declarations associated to a node in the rule tree, and so forth for other data.
