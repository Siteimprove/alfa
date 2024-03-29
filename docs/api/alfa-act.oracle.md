<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-act](./alfa-act.md) &gt; [Oracle](./alfa-act.oracle.md)

## Oracle type

\* QUESTION: questions' metadata type; has the shape { URI: \[T, A\] } where URI is the question URI, T a representation of the expected return type, and A the actual return type. Example: { "q1": \["boolean", boolean\], "q2": \["number?", number \| undefined\], }

**Signature:**

```typescript
export type Oracle<INPUT, TARGET extends Hashable, QUESTION extends Question.Metadata, SUBJECT> = (rule: Rule<INPUT, TARGET, QUESTION, SUBJECT>, question: {
    [URI in keyof QUESTION]: Question<QUESTION[URI][0], SUBJECT, TARGET, QUESTION[URI][1], unknown, URI extends string ? URI : never>;
}[keyof QUESTION]) => Future<Option<QUESTION[keyof QUESTION][1]>>;
```
**References:** [Question.Metadata](./alfa-act.question.metadata.md)

