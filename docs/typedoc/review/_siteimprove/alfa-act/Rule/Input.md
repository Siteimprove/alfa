# Type Alias: Input\<R\>

```ts
type Input<R> = R extends Rule<infer I, any, any, any> ? I : never;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

## Type Parameters

### R

`R`
