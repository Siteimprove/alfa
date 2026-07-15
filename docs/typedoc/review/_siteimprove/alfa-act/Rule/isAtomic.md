# Variable: isAtomic

```ts
isAtomic: {
<I, T, Q, S>  (value: Rule<I, T, Q, S>): value is Atomic<I, T, Q, S>;
<I, T, Q, S>  (value: unknown): value is Atomic<I, T, Q, S>;
};
```

## Call Signature

```typescript
<I, T extends Hashable, Q extends Metadata, S>(value: Rule<I, T, Q, S>): value is Atomic<I, T, Q, S>;
```

## Call Signature

```typescript
<I, T extends Hashable, Q extends Metadata, S>(value: unknown): value is Atomic<I, T, Q, S>;
```
