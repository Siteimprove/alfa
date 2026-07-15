# Type Alias: Interview\<QUESTION, SUBJECT, CONTEXT, ANSWER, D\>

```ts
type Interview<QUESTION, SUBJECT, CONTEXT, ANSWER, D> = 
  | ANSWER
  | { [URI in keyof QUESTION]: Question<QUESTION[URI][0], SUBJECT, CONTEXT, QUESTION[URI][1], D extends -1 ? ANSWER : Interview<QUESTION, SUBJECT, CONTEXT, ANSWER, Depths[D]>, URI extends string ? URI : never> }[keyof QUESTION];
```

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `QUESTION` *extends* [`Metadata`](Question/Metadata.md) | - |
| `SUBJECT` | - |
| `CONTEXT` | - |
| `ANSWER` | - |
| `D` *extends* `number` | [`MaxDepth`](Interview/MaxDepth.md) |
