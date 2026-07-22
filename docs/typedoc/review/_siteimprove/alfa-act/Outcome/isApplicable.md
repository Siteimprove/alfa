# Variable: isApplicable

```ts
isApplicable: {
<I, T, Q, S>  (value: Outcome<I, T, Q, S>): value is Applicable<I, T, Q, S>;
<I, T, Q, S>  (value: unknown): value is Applicable<I, T, Q, S>;
};
```

## Call Signature

```ts
<I, T extends Hashable, Q extends Metadata, S>(value: Outcome<I, T, Q, S>): value is Applicable<I, T, Q, S>;
```

## Call Signature

```ts
<I, T extends Hashable, Q extends Metadata, S>(value: unknown): value is Applicable<I, T, Q, S>;
```
