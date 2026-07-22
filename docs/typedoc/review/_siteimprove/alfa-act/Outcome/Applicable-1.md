# Type Alias: Applicable\<I, T extends Hashable, Q extends Metadata = { }, S = T\>

```ts
type Applicable<I, T extends Hashable, Q extends Metadata = {
}, S = T> = 
  | Passed<I, T, Q, S>
  | Failed<I, T, Q, S>
| CantTell<I, T, Q, S>;
```
