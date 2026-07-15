# Variable: isFailed

```ts
isFailed: {
<I, T, Q, S>  (value: Outcome<I, T, Q, S>): value is Failed<I, T, Q, S>;
<I, T, Q, S>  (value: unknown): value is Failed<I, T, Q, S>;
};
```

## Call Signature

```typescript
<I, T extends Hashable, Q extends Metadata, S>(value: Outcome<I, T, Q, S>): value is Failed<I, T, Q, S>;
```

## Call Signature

```typescript
<I, T extends Hashable, Q extends Metadata, S>(value: unknown): value is Failed<I, T, Q, S>;
```
