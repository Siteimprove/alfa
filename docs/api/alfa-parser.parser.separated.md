<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-parser](./alfa-parser.md) &gt; [Parser](./alfa-parser.parser.md) &gt; [separated](./alfa-parser.parser.separated.md)

## Parser.separated() function

**Signature:**

```typescript
export function separated<I, T, U, E, A extends Array<unknown> = []>(parser: Parser<I, T, E, A>, separator: Parser<I, unknown, E, A>): Parser<I, [T, T], E, A>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  parser | [Parser](./alfa-parser.parser.md)<!-- -->&lt;I, T, E, A&gt; |  |
|  separator | [Parser](./alfa-parser.parser.md)<!-- -->&lt;I, unknown, E, A&gt; |  |

**Returns:**

[Parser](./alfa-parser.parser.md)<!-- -->&lt;I, \[T, T\], E, A&gt;

