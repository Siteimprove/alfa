# Variable: `hasName`

```ts
hasName: {
<N>  (predicate: Refinement<string, N>): Refinement<Attribute<string>, Attribute<N>>;
<N>  (name: N, ...rest: N[]): Refinement<Attribute<string>, Attribute<N>>;
};
```

## Call Signature

```ts
<N extends string = string>(predicate: Refinement<string, N>): Refinement<Attribute<string>, Attribute<N>>;
```

## Call Signature

```ts
<N extends string = string>(name: N, ...rest: N[]): Refinement<Attribute<string>, Attribute<N>>;
```
