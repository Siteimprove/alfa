<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-tuple](./alfa-tuple.md) &gt; [Tuple](./alfa-tuple.tuple.md) &gt; [Last](./alfa-tuple.tuple.last.md)

## Tuple.Last type

**Signature:**

```typescript
export type Last<T extends Tuple> = T extends readonly [infer H, ...infer R] ? R extends Empty ? H : Last<R> : never;
```
**References:** [Tuple](./alfa-tuple.tuple.md)<!-- -->, [Empty](./alfa-tuple.tuple.empty.md)<!-- -->, [Last](./alfa-tuple.tuple.last.md)

