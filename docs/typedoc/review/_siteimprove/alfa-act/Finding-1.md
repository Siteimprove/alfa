# Type Alias: Finding\<`ANSWER`, `DIAGNOSTIC` *extends* [`Diagnostic`](Diagnostic-1.md) = [`Diagnostic`](Diagnostic-1.md)\>

```ts
type Finding<ANSWER, DIAGNOSTIC> = Either<[ANSWER, boolean], [DIAGNOSTIC, boolean]>;
```
