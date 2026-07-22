# Function: `isFailed()`

## Call Signature

```ts
function isFailed<I, T extends Hashable, Q extends Metadata, S>(value: Outcome<I, T, Q, S>): value is Failed<I, T, Q, S>;
```

## Call Signature

```ts
function isFailed<I, T extends Hashable, Q extends Metadata, S>(value: unknown): value is Failed<I, T, Q, S>;
```
