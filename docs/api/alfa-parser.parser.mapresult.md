<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-parser](./alfa-parser.md) &gt; [Parser](./alfa-parser.parser.md) &gt; [mapResult](./alfa-parser.parser.mapresult.md)

## Parser.mapResult() function

**Signature:**

```typescript
export function mapResult<I, T, U, E, A extends Array<unknown> = []>(parser: Parser<I, T, E, A>, mapper: Mapper<T, Result<U, E>>): Parser<I, U, E, A>;
```

## Parameters

<table><thead><tr><th>

Parameter


</th><th>

Type


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

parser


</td><td>

[Parser](./alfa-parser.parser.md)<!-- -->&lt;I, T, E, A&gt;


</td><td>


</td></tr>
<tr><td>

mapper


</td><td>

[Mapper](./alfa-mapper.mapper.md)<!-- -->&lt;T, Result&lt;U, E&gt;&gt;


</td><td>


</td></tr>
</tbody></table>

**Returns:**

[Parser](./alfa-parser.parser.md)<!-- -->&lt;I, U, E, A&gt;

