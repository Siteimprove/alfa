<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-act](./alfa-act.md) &gt; [Outcome](./alfa-act.outcome.md) &gt; [Failed](./alfa-act.outcome.failed.md) &gt; [of](./alfa-act.outcome.failed.of.md)

## Outcome.Failed.of() method

**Signature:**

```typescript
static of<I, T extends Hashable, Q extends Question.Metadata, S>(rule: Rule<I, T, Q, S>, target: T, expectations: Record<{
            [key: string]: Result<Diagnostic>;
        }>, mode: Mode): Failed<I, T, Q, S>;
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

rule


</td><td>

Rule&lt;I, T, Q, S&gt;


</td><td>


</td></tr>
<tr><td>

target


</td><td>

T


</td><td>


</td></tr>
<tr><td>

expectations


</td><td>

Record&lt;{ \[key: string\]: Result&lt;Diagnostic&gt;; }&gt;


</td><td>


</td></tr>
<tr><td>

mode


</td><td>

[Mode](./alfa-act.outcome.mode.md)


</td><td>


</td></tr>
</tbody></table>

**Returns:**

[Failed](./alfa-act.outcome.failed.md)<!-- -->&lt;I, T, Q, S&gt;

