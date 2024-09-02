---
"@siteimprove/alfa-device": patch
---

**Added:** `Native.fromWindow` can now be called with no argument and will default to `globalThis.window`.

This is useful in injection contexts where grabbing the window beforehand to inject it is tricky, and bundling a function that wraps `() => Native.fromWindow(window)` to properly serialise it is inconvenient.
