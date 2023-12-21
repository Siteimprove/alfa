---
"@siteimprove/alfa-media": minor
---

**Breaking:** Names `Feature`, `Modifier`, `Type`, `Value` are now directly exported by the package.

That is, replace

```typescript
import { Media } from "@siteimprove/alfa-media";
declare;
x: Media.Feature;
```

with

```typescript
import { Feature as MediaFeature } from "@siteimprove/alfa-media";
declare;
x: MediaFeature;
```
