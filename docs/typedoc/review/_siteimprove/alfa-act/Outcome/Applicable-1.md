# Type Alias: Applicable\<I, T, Q, S\>

```ts
type Applicable<I, T, Q, S> = 
  | Passed<I, T, Q, S>
  | Failed<I, T, Q, S>
| CantTell<I, T, Q, S>;
```

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `I` | - |
| `T` *extends* `Hashable` | - |
| `Q` *extends* [`Metadata`](../Question/Metadata.md) | \{ \} |
| `S` | `T` |
