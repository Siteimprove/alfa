# Type Alias: Oracle\<`INPUT`, `TARGET` *extends* `Hashable`, `QUESTION` *extends* [`Metadata`](Question/Metadata.md), `SUBJECT`\>

```ts
type Oracle<INPUT, TARGET, QUESTION, SUBJECT> = (rule: Rule<INPUT, TARGET, QUESTION, SUBJECT>, question: { [URI in keyof QUESTION]: Question<QUESTION[URI][0], SUBJECT, TARGET, QUESTION[URI][1], unknown, URI extends string ? URI : never> }[keyof QUESTION]) => Promise<Option<QUESTION[keyof QUESTION][1]>>;
```
