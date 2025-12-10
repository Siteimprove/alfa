---
"@siteimprove/alfa-toolchain": patch
---

**Added:** `yarn generate-dependency-graph` can now generate only some of the graphs.

E.g.:

- `yarn generate-dependency-graphs $(pwd) all` to generate all graphs.
- `yarn generate-dependency-graphs $(pwd) global` to generate all graphsonly the global graph.
- `yarn generate-dependency-graphs $(pwd) alfa-css` to generate all graphonly the graphs for packages containing `alfa-css` in their name.
