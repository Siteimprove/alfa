# Variable: hasName

```ts
hasName: {
<N>  (predicate: Refinement<string, N>): Refinement<Element<string>, Element<N>>;
<N>  (name: N, ...rest: N[]): Refinement<Element<string>, Element<N>>;
};
```

## Call Signature

```typescript
<N extends string = string>(predicate: Refinement<string, N>): Refinement<Element<string>, Element<N>>;
```

## Call Signature

```typescript
<N extends string = string>(name: N, ...rest: N[]): Refinement<Element<string>, Element<N>>;
```
