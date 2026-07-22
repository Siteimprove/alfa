# Function: isComposite()

## Call Signature

```ts
function isComposite<I, T extends Hashable, Q extends Metadata>(value: Rule<I, T, Q>): value is Composite<I, T, Q, T>;
```

## Call Signature

```ts
function isComposite<I, T extends Hashable, Q extends Metadata>(value: unknown): value is Composite<I, T, Q, T>;
```
