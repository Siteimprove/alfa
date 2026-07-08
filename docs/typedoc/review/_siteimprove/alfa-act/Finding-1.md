# Type Alias: Finding\<ANSWER, DIAGNOSTIC\>

```ts
type Finding<ANSWER, DIAGNOSTIC> = Either<[ANSWER, boolean], [DIAGNOSTIC, boolean]>;
```

Defined in: [alfa-act/src/expectation/finding.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/expectation/finding.ts)

## Type Parameters

### ANSWER

`ANSWER`

### DIAGNOSTIC

`DIAGNOSTIC` *extends* [`Diagnostic`](Diagnostic-1.md) = [`Diagnostic`](Diagnostic-1.md)
