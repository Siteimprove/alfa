# Type Alias: Interview\<QUESTION, SUBJECT, CONTEXT, ANSWER, D\>

```ts
type Interview<QUESTION, SUBJECT, CONTEXT, ANSWER, D> = 
  | ANSWER
  | { [URI in keyof QUESTION]: Question<QUESTION[URI][0], SUBJECT, CONTEXT, QUESTION[URI][1], D extends -1 ? ANSWER : Interview<QUESTION, SUBJECT, CONTEXT, ANSWER, Depths[D]>, URI extends string ? URI : never> }[keyof QUESTION];
```

Defined in: [alfa-act/src/expectation/interview.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/interview.ts)

## Type Parameters

### QUESTION

`QUESTION` *extends* [`Metadata`](Question/Metadata.md)

### SUBJECT

`SUBJECT`

### CONTEXT

`CONTEXT`

### ANSWER

`ANSWER`

### D

`D` *extends* `number` = [`MaxDepth`](Interview/MaxDepth.md)
