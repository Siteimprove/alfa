<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-act](./alfa-act.md) &gt; [Interview](./alfa-act.interview.md) &gt; [conduct](./alfa-act.interview.conduct.md)

## Interview.conduct() function

Conduct an interview: \* if it is an answer, just send it back; \* if it is a rhetorical question, fetch its answer and recursively conduct an interview on it; \* if it is a true question, ask it to the oracle and recursively conduct an interview on the result.

Oracles must return Options, to have the possibility to not answer a given question (by returning None). Oracles must return Futures, because the full interview process is essentially async (e.g., asking through a CLI).

The final result of the interview is either a final answer (Left), or a diagnostic (Right) explaining why a final answer couldn't be found. Final answer will be turned into Passed/Failed outcomes, and diagnostic into Can't tell; the diagnostic is provided by the last unanswered question.

In both cases, we also record whether the oracle was actually used; this is useful to record the mode (auto/semi-auto) of the outcome.

<b>Signature:</b>

```typescript
function conduct<INPUT, TARGET extends Hashable, QUESTION, SUBJECT, ANSWER>(interview: Interview<QUESTION, SUBJECT, TARGET, ANSWER>, rule: Rule<INPUT, TARGET, QUESTION, SUBJECT>, oracle: Oracle<INPUT, TARGET, QUESTION, SUBJECT>, oracleUsed?: boolean): Future<Either<Tuple<[ANSWER, boolean]>, Tuple<[Diagnostic, boolean]>>>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  interview | [Interview](./alfa-act.interview.md)<!-- -->&lt;QUESTION, SUBJECT, TARGET, ANSWER&gt; |  |
|  rule | [Rule](./alfa-act.rule.md)<!-- -->&lt;INPUT, TARGET, QUESTION, SUBJECT&gt; |  |
|  oracle | [Oracle](./alfa-act.oracle.md)<!-- -->&lt;INPUT, TARGET, QUESTION, SUBJECT&gt; |  |
|  oracleUsed | boolean | <i>(Optional)</i> |

<b>Returns:</b>

[Future](./alfa-future.future.md)<!-- -->&lt;[Either](./alfa-either.either.md)<!-- -->&lt;[Tuple](./alfa-tuple.tuple.md)<!-- -->&lt;\[ANSWER, boolean\]&gt;, [Tuple](./alfa-tuple.tuple.md)<!-- -->&lt;\[[Diagnostic](./alfa-act.diagnostic.md)<!-- -->, boolean\]&gt;&gt;&gt;
