# Variable: passed

```ts
passed: <I, T, Q, S>(rule, target, expectations, mode) => Passed<I, T, Q, S>;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

## Type Parameters

### I

`I`

### T

`T` *extends* `Hashable`

### Q

`Q` *extends* [`Metadata`](../Question/Metadata.md)

### S

`S`

## Parameters

### rule

[`Rule`](../Rule-1.md)\<`I`, `T`, `Q`, `S`\>

### target

`T`

### expectations

`Record`\<\{
\[`key`: `string`\]: `Result`\<[`Diagnostic`](../Diagnostic-1.md), [`Diagnostic`](../Diagnostic-1.md)\>;
\}\>

### mode

[`Mode`](Mode.md)

## Returns

[`Passed`](Passed-2.md)\<`I`, `T`, `Q`, `S`\>
