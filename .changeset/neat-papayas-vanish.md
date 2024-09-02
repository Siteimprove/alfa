---
"@siteimprove/alfa-dom": minor
---

**Added:** `Navive.fromNode` can now be called with no argument, in which case it will default to `window.document`.

It is not possible to provide options this way.

This is useful in settings where the serialisation must be injected into another context (e.g. headless browser), to avoid specifically fetching the document or using a bundler to inject `() => Native.fromNode(window.document)` to read it from inside the other context.
