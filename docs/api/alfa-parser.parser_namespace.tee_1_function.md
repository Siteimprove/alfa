<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-parser](./alfa-parser.md) &gt; [Parser](./alfa-parser.parser_namespace.md) &gt; [tee](./alfa-parser.parser_namespace.tee_1_function.md)

## Parser.tee() function

<b>Signature:</b>

```typescript
function tee<I, T, E, A extends Array<unknown> = []>(parser: Parser<I, T, E, A>, callback: Callback<T, void, [remainder: I, ...args: A]>): Parser<I, T, E, A>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  parser | [Parser](./alfa-parser.parser_typealias.md)<!-- -->&lt;I, T, E, A&gt; |  |
|  callback | [Callback](./alfa-callback.callback_typealias.md)<!-- -->&lt;T, void, \[remainder: I, ...args: A\]&gt; |  |

<b>Returns:</b>

[Parser](./alfa-parser.parser_typealias.md)<!-- -->&lt;I, T, E, A&gt;

