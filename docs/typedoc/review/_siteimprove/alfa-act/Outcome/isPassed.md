# Variable: isPassed

```ts
isPassed: {
<I, T, Q, S>  (value: Outcome<I, T, Q, S>): value is Passed<I, T, Q, S>;
<I, T, Q, S>  (value: unknown): value is Passed<I, T, Q, S>;
};
```

## Call Signature

```typescript
<I, T extends Hashable, Q extends Metadata, S>(value: Outcome<I, T, Q, S>): value is Passed<I, T, Q, S>;
```

## Call Signature

```typescript
<I, T extends Hashable, Q extends Metadata, S>(value: unknown): value is Passed<I, T, Q, S>;
```
