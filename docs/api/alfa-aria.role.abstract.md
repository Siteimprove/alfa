<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-aria](./alfa-aria.md) &gt; [Role](./alfa-aria.role.md) &gt; [Abstract](./alfa-aria.role.abstract.md)

## Role.Abstract type

The names of all abstract roles.

**Signature:**

```typescript
type Abstract = {
        [N in Name]: Roles[N]["abstract"] extends true ? N : never;
    }[Name];
```
**References:** [Name](./alfa-aria.role.name.md)

