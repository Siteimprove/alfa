<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-parser](./alfa-parser.md) &gt; [Parser](./alfa-parser.parser.md) &gt; [reject](./alfa-parser.parser.reject_1.md)

## Parser.reject() function

**Signature:**

```typescript
export function reject<I, T, E, A extends Array<unknown> = []>(parser: Parser<I, T, E, A>, predicate: Predicate<T>, ifError: Mapper<T, E>): Parser<I, T, E, A>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  parser | [Parser](./alfa-parser.parser.md)<!-- -->&lt;I, T, E, A&gt; |  |
|  predicate | Predicate&lt;T&gt; |  |
|  ifError | [Mapper](./alfa-mapper.mapper.md)<!-- -->&lt;T, E&gt; |  |

**Returns:**

[Parser](./alfa-parser.parser.md)<!-- -->&lt;I, T, E, A&gt;

