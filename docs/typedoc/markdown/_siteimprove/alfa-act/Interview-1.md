[**Alfa API documentation**](../../README.md)

***

[Alfa API documentation](../../README.md) / [@siteimprove/alfa-act](../alfa-act.md) / Interview

# Type Alias: Interview\<QUESTION, SUBJECT, CONTEXT, ANSWER, D\>

> **Interview**\<`QUESTION`, `SUBJECT`, `CONTEXT`, `ANSWER`, `D`\> = `ANSWER` \| `{ [URI in keyof QUESTION]: Question<QUESTION[URI][0], SUBJECT, CONTEXT, QUESTION[URI][1], D extends -1 ? ANSWER : Interview<QUESTION, SUBJECT, CONTEXT, ANSWER, Depths[D]>, URI extends string ? URI : never> }`\[keyof `QUESTION`\]

Defined in: [alfa-act/src/expectation/interview.ts:39](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/interview.ts#L39)

An Interview is either a direct ANSWER; or a question who is ultimately going
to produce one, possibly through more questions (aka, an Interview).

The QUESTION type maps questions' URI to the expected type of answer, both as
a JavaScript manipulable representation (T), and an actual type (A).
The SUBJECT and CONTEXT types are the subject and context of the question.

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `QUESTION` *extends* [`Metadata`](Question/Metadata.md) | - |
| `SUBJECT` | - |
| `CONTEXT` | - |
| `ANSWER` | - |
| `D` *extends* `number` | [`MaxDepth`](Interview/MaxDepth.md) |

## Remarks

That is, an Interview is either:
* an ANSWER.
* A Question, expecting an Interview, provided its URI, answer type
  (QUESTION[URI][1]), and answer type representation (QUESTION[URI][0]) are correct.
  The returned interview has depth one smaller.

The complex object keys mapping ensure that the question's URI exist in the
metadata.
