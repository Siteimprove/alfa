# Function: `isAtomic()`

## Call Signature

```ts
function isAtomic<I, T extends Hashable, Q extends Metadata, S>(value: Rule<I, T, Q, S>): value is Atomic<I, T, Q, S>;
```

## Call Signature

```ts
function isAtomic<I, T extends Hashable, Q extends Metadata, S>(value: unknown): value is Atomic<I, T, Q, S>;
```
