# Type Alias: Finding\<ANSWER, DIAGNOSTIC\>

```ts
type Finding<ANSWER, DIAGNOSTIC> = Either<[ANSWER, boolean], [DIAGNOSTIC, boolean]>;
```

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `ANSWER` | - |
| `DIAGNOSTIC` *extends* [`Diagnostic`](Diagnostic-1.md) | [`Diagnostic`](Diagnostic-1.md) |
