# Type Alias: Applicable\<`I`, `T` *extends* `Hashable`, `Q` *extends* [`Metadata`](../Question/Metadata.md) = \{ \}, `S` = `T`\>

```ts
type Applicable<I, T, Q, S> = 
  | Passed<I, T, Q, S>
  | Failed<I, T, Q, S>
| CantTell<I, T, Q, S>;
```
