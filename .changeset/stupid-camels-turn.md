---
"@siteimprove/alfa-selective": minor
---

**Added:** A `#ifGuarded` method is now available.

This is useful for `Selective` that share part of the branch, to avoid re-doing potentially costly tests or building nested `Selective`. E.g., it can replace

```typescript
Selective.of(x)
  .if(and(isFoo, isBar), fooBar)
  .if(isFoo /* and not(isBar) */, fooNotBar);
```

with

```typescript
Selective.of(x).ifGuarded(isFoo, isBar, fooBar, fooNotBar);
```
