---
"@siteimprove/alfa-rules": minor
---

**Added:** Diagnostic subclasses have been added to the public API

The subclasses of the `Diagnostic` class are now part of the public API.
Example of usage:

```
import { Diagnostic } from "@siteimprove/alfa-rules";

function foo(d: Diagnostic.Languages) {
  // ...
}
```
