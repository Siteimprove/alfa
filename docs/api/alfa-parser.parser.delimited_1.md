<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-parser](./alfa-parser.md) &gt; [Parser](./alfa-parser.parser.md) &gt; [delimited](./alfa-parser.parser.delimited_1.md)

## Parser.delimited() function

**Signature:**

```typescript
export function delimited<I, T, E, A extends Array<unknown> = []>(left: Parser<I, unknown, E, A>, parser: Parser<I, T, E, A>, right: Parser<I, unknown, E, A>): Parser<I, T, E, A>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  left | [Parser](./alfa-parser.parser.md)<!-- -->&lt;I, unknown, E, A&gt; |  |
|  parser | [Parser](./alfa-parser.parser.md)<!-- -->&lt;I, T, E, A&gt; |  |
|  right | [Parser](./alfa-parser.parser.md)<!-- -->&lt;I, unknown, E, A&gt; |  |

**Returns:**

[Parser](./alfa-parser.parser.md)<!-- -->&lt;I, T, E, A&gt;

