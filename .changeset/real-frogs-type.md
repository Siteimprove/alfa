---
"@siteimprove/alfa-highlight": minor
"@siteimprove/alfa-rules": minor
---

**Removed:** The `@siteimprove/alfa-highlight/mark` and `@siteimprove/alfa-rules/FlattenedRules` exports are no longer available.

These were duplicating similar exports of the package.

Replace `mark` with the equivalent `Marker`.

Replace `import { FlattenedRules } from "@siteimprove/alfa-rules"` with `import FlattenedRules from "@siteimprove/alfa-rules"`.
