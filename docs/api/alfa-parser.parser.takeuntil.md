<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-parser](./alfa-parser.md) &gt; [Parser](./alfa-parser.parser.md) &gt; [takeUntil](./alfa-parser.parser.takeuntil.md)

## Parser.takeUntil() function

<b>Signature:</b>

```typescript
function takeUntil<I, T, E, A extends Array<unknown> = []>(parser: Parser<I, T, E, A>, condition: Parser<I, unknown, E, A>): Parser<I, Array<T>, E, A>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  parser | [Parser](./alfa-parser.parser.md)<!-- -->&lt;I, T, E, A&gt; |  |
|  condition | [Parser](./alfa-parser.parser.md)<!-- -->&lt;I, unknown, E, A&gt; |  |

<b>Returns:</b>

[Parser](./alfa-parser.parser.md)<!-- -->&lt;I, Array&lt;T&gt;, E, A&gt;
