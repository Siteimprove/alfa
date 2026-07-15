# Function: isComposite()

## Call Signature

```typescript
function isComposite<I, T extends Hashable, Q extends Metadata>(value: Rule<I, T, Q>): value is Composite<I, T, Q, T>;
```

## Call Signature

```typescript
function isComposite<I, T extends Hashable, Q extends Metadata>(value: unknown): value is Composite<I, T, Q, T>;
```
