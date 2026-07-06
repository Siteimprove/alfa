[**Alfa API documentation**](../../README.md)

***

[Alfa API documentation](../../README.md) / [@siteimprove/alfa-act](../alfa-act.md) / Oracle

# Type Alias: Oracle\<INPUT, TARGET, QUESTION, SUBJECT\>

> **Oracle**\<`INPUT`, `TARGET`, `QUESTION`, `SUBJECT`\> = (`rule`, `question`) => `Promise`\<`Option`\<`QUESTION`\[keyof `QUESTION`\]\[`1`\]\>\>

Defined in: [alfa-act/src/expectation/oracle.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/oracle.ts)

* QUESTION: questions' metadata type; has the shape { URI: [T, A] } where
            URI is the question URI, T a representation of the expected return
            type, and A the actual return type.
            Example:
            {
              "q1": ["boolean", boolean],
              "q2": ["number?", number | undefined],
            }

## Type Parameters

| Type Parameter |
| ------ |
| `INPUT` |
| `TARGET` *extends* `Hashable` |
| `QUESTION` *extends* [`Metadata`](Question/Metadata.md) |
| `SUBJECT` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `rule` | [`Rule`](Rule-1.md)\<`INPUT`, `TARGET`, `QUESTION`, `SUBJECT`\> |
| `question` | `{ [URI in keyof QUESTION]: Question<QUESTION[URI][0], SUBJECT, TARGET, QUESTION[URI][1], unknown, URI extends string ? URI : never> }`\[keyof `QUESTION`\] |

## Returns

`Promise`\<`Option`\<`QUESTION`\[keyof `QUESTION`\]\[`1`\]\>\>
