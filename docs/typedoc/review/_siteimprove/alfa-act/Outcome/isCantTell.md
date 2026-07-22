# Variable: isCantTell

```ts
isCantTell: {
<I, T, Q, S>  (value: Outcome<I, T, Q, S>): value is CantTell<I, T, Q, S>;
<I, T, Q, S>  (value: unknown): value is CantTell<I, T, Q, S>;
};
```

## Call Signature

```ts
<I, T extends Hashable, Q extends Metadata, S>(value: Outcome<I, T, Q, S>): value is CantTell<I, T, Q, S>;
```

## Call Signature

```ts
<I, T extends Hashable, Q extends Metadata, S>(value: unknown): value is CantTell<I, T, Q, S>;
```
