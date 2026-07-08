# Function: from()

```ts
function from<I, T, Q, S>(
   rule: Rule<I, T, Q, S>, 
   target: T, 
   expectations: Record<{
[key: string]: Option<Result<Diagnostic, Diagnostic>>;
}>, 
mode: Mode): Applicable<I, T, Q, S>;
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
\[`key`: `string`\]: `Option`\<`Result`\<[`Diagnostic`](../Diagnostic-1.md), [`Diagnostic`](../Diagnostic-1.md)\>\>;
\}\>

### mode

[`Mode`](Mode.md)

## Returns

[`Applicable`](Applicable-1.md)\<`I`, `T`, `Q`, `S`\>
