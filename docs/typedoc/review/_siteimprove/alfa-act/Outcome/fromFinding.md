# Function: fromFinding()

```ts
function fromFinding<I, T, Q, S>(rule, target): (finding) => Applicable<I, T, Q, S>;
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

## Returns

(`finding`) => [`Applicable`](Applicable-1.md)\<`I`, `T`, `Q`, `S`\>
