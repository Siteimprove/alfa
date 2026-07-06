[**Alfa API documentation**](../../../README.md)

***

[Alfa API documentation](../../../README.md) / [@siteimprove/alfa-act](../../alfa-act.md) / [Interview](../Interview.md) / conduct

# Function: conduct()

> **conduct**\<`INPUT`, `TARGET`, `QUESTION`, `SUBJECT`, `ANSWER`\>(`interview`, `rule`, `oracle`, `oracleUsed?`): `Promise`\<[`Finding`](../Finding-1.md)\<`ANSWER`\>\>

Defined in: [alfa-act/src/expectation/interview.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/interview.ts)

Conduct an interview:
 * if it is an answer, just send it back;
 * if it is a rhetorical question, fetch its answer and recursively conduct
   an interview on it;
 * if it is a true question, ask it to the oracle and recursively conduct an
   interview on the result.

 Oracles must return Options, to have the possibility to not answer a given
 question (by returning None).
 Oracles must return Promises, because the full interview process is
 essentially async (e.g., asking through a CLI).

 The final result of the interview is either a conclusive finding with an
 answer, or  an inconclusive finding with a diagnostic explaining why an
 answer couldn't be found.
 Conclusive findings will be turned into Passed/Failed outcomes, and
 inconclusive ones  into Can't tell; the diagnostic is provided by the last
 unanswered question.

 In both cases, we also record whether the oracle was actually used;
 this is useful to record the mode (auto/semi-auto) of the outcome.

## Type Parameters

| Type Parameter |
| ------ |
| `INPUT` |
| `TARGET` *extends* `Hashable` |
| `QUESTION` *extends* [`Metadata`](../Question/Metadata.md) |
| `SUBJECT` |
| `ANSWER` |

## Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `interview` | [`Interview`](../Interview-1.md)\<`QUESTION`, `SUBJECT`, `TARGET`, `ANSWER`\> | `undefined` |
| `rule` | [`Rule`](../Rule-1.md)\<`INPUT`, `TARGET`, `QUESTION`, `SUBJECT`\> | `undefined` |
| `oracle` | [`Oracle`](../Oracle.md)\<`INPUT`, `TARGET`, `QUESTION`, `SUBJECT`\> | `undefined` |
| `oracleUsed` | `boolean` | `false` |

## Returns

`Promise`\<[`Finding`](../Finding-1.md)\<`ANSWER`\>\>
