<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-act](./alfa-act.md) &gt; [Outcome](./alfa-act.outcome.md) &gt; [Passed](./alfa-act.outcome.passed.md) &gt; [of](./alfa-act.outcome.passed.of.md)

## Outcome.Passed.of() method

<b>Signature:</b>

```typescript
static of<I, T extends Hashable, Q, S>(rule: Rule<I, T, Q, S>, target: T, expectations: Record<{
            [key: string]: Result<Diagnostic>;
        }>, mode: Mode): Passed<I, T, Q, S>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  rule | [Rule](./alfa-act.rule.md)<!-- -->&lt;I, T, Q, S&gt; |  |
|  target | T |  |
|  expectations | Record&lt;{ \[key: string\]: [Result](./alfa-result.result.md)<!-- -->&lt;[Diagnostic](./alfa-act.diagnostic.md)<!-- -->&gt;; }&gt; |  |
|  mode | [Mode](./alfa-act.outcome.mode.md) |  |

<b>Returns:</b>

[Passed](./alfa-act.outcome.passed.md)<!-- -->&lt;I, T, Q, S&gt;
