---
"@siteimprove/alfa-rules": minor
---

**Removed:** The `@siteimprove/alfa-rules/FlattenedRules` export is no longer available.

This was duplicating similar exports of the package.

Replace `import { FlattenedRules } from "@siteimprove/alfa-rules"` with `import FlattenedRules from "@siteimprove/alfa-rules"`.
