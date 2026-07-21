# Type Alias: Interview\<`QUESTION` *extends* [`Metadata`](Question/Metadata.md), `SUBJECT`, `CONTEXT`, `ANSWER`, `D` *extends* `number` = [`MaxDepth`](Interview/MaxDepth.md)\>

```ts
type Interview<QUESTION extends Metadata, SUBJECT, CONTEXT, ANSWER, D extends number = MaxDepth> = 
  | ANSWER
  | { [URI in keyof QUESTION]: Question<QUESTION[URI][0], SUBJECT, CONTEXT, QUESTION[URI][1], D extends -1 ? ANSWER : Interview<QUESTION, SUBJECT, CONTEXT, ANSWER, Depths[D]>, URI extends string ? URI : never> }[keyof QUESTION];
```
