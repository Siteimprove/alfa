<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-wcag](./alfa-wcag.md) &gt; [Criterion](./alfa-wcag.criterion_namespace.md) &gt; [URI](./alfa-wcag.criterion_namespace.uri_typealias.md)

## Criterion.URI type

The URI of the specified criterion.

<b>Signature:</b>

```typescript
type URI<C extends Chapter = Chapter, V extends Version = Version> = Criteria[C]["versions"] extends Iterable<infer T> ? T extends readonly [V, {
        readonly uri: infer U;
    }] ? U : never : never;
```
<b>References:</b> [Chapter](./alfa-wcag.criterion_namespace.chapter_typealias.md)<!-- -->, [Version](./alfa-wcag.criterion_namespace.version_typealias.md)

