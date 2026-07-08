# Type Alias: Applicable\<I, T, Q, S\>

```ts
type Applicable<I, T, Q, S> = 
  | Passed<I, T, Q, S>
  | Failed<I, T, Q, S>
| CantTell<I, T, Q, S>;
```

Defined in: [alfa-act/src/outcome.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/outcome.ts)

## Type Parameters

### I

`I`

### T

`T` *extends* `Hashable`

### Q

`Q` *extends* [`Metadata`](../Question/Metadata.md) = \{
\}

### S

`S` = `T`
