# Function: isApplicable()

## Call Signature

```typescript
function isApplicable<I, T extends Hashable, Q extends Metadata, S>(value: Outcome<I, T, Q, S>): value is Applicable<I, T, Q, S>;
```

## Call Signature

```typescript
function isApplicable<I, T extends Hashable, Q extends Metadata, S>(value: unknown): value is Applicable<I, T, Q, S>;
```
