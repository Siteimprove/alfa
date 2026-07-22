# Function: `isQuestion()`

```ts
function isQuestion<TYPE, SUBJECT, CONTEXT, ANSWER, T = ANSWER, URI extends string = string>(value: unknown): value is Question<TYPE, SUBJECT, CONTEXT, ANSWER, T, URI>;
```
