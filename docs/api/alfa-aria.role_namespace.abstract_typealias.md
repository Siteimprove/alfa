<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-aria](./alfa-aria.md) &gt; [Role](./alfa-aria.role_namespace.md) &gt; [Abstract](./alfa-aria.role_namespace.abstract_typealias.md)

## Role.Abstract type

The names of all abstract roles.

<b>Signature:</b>

```typescript
type Abstract = {
        [N in Name]: Roles[N]["abstract"] extends true ? N : never;
    }[Name];
```
<b>References:</b> [Name](./alfa-aria.role_namespace.name_typealias.md)

