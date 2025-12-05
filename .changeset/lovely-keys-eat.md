---
"@siteimprove/alfa-toolchain": patch
---

**Changed:** Global dependency graph now only includes dependencies in the current workspaces, rather than by scope.

This allows to have several workspaces with the same scope without pulling everything out, typically the situation we have with many `alfa-integrations` packages depending on the main `alfa` packages.
