# Type Alias: Input\<R\>

```ts
type Input<R> = R extends Rule<infer I, any, any, any> ? I : never;
```

## Type Parameters

| Type Parameter |
| ------ |
| `R` |
