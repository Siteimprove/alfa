---
"@siteimprove/alfa-toolchain": patch
---

**Added:** `yarn generate-dependency-graph` can now generate only some of the graphs.

E.g.:

- `yarn generate-dependency-graphs $(pwd) all` to generate all graphs.
- `yarn generate-dependency-graphs $(pwd) global` to generate all only the global graph.
- `yarn generate-dependency-graphs $(pwd) alfa-css` to generate only the graphs for packages containing `alfa-css` in their name.
