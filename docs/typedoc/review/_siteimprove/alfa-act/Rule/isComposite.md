# Variable: `isComposite`

```ts
isComposite: {
<I, T, Q>  (value: Rule<I, T, Q>): value is Composite<I, T, Q, T>;
<I, T, Q>  (value: unknown): value is Composite<I, T, Q, T>;
};
```

## Call Signature

```ts
<I, T extends Hashable, Q extends Metadata>(value: Rule<I, T, Q>): value is Composite<I, T, Q, T>;
```

## Call Signature

```ts
<I, T extends Hashable, Q extends Metadata>(value: unknown): value is Composite<I, T, Q, T>;
```
