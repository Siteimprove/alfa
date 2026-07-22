# Function: isPassed()

## Call Signature

```ts
function isPassed<I, T extends Hashable, Q extends Metadata, S>(value: Outcome<I, T, Q, S>): value is Passed<I, T, Q, S>;
```

## Call Signature

```ts
function isPassed<I, T extends Hashable, Q extends Metadata, S>(value: unknown): value is Passed<I, T, Q, S>;
```
