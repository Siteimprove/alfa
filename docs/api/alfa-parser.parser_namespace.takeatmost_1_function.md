<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-parser](./alfa-parser.md) &gt; [Parser](./alfa-parser.parser_namespace.md) &gt; [takeAtMost](./alfa-parser.parser_namespace.takeatmost_1_function.md)

## Parser.takeAtMost() function

<b>Signature:</b>

```typescript
function takeAtMost<I, T, E, A extends Array<unknown> = []>(parser: Parser<I, T, E, A>, upper: number): Parser<I, Array<T>, E, A>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  parser | [Parser](./alfa-parser.parser_typealias.md)<!-- -->&lt;I, T, E, A&gt; |  |
|  upper | number |  |

<b>Returns:</b>

[Parser](./alfa-parser.parser_typealias.md)<!-- -->&lt;I, Array&lt;T&gt;, E, A&gt;

