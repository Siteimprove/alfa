# Type Alias: Question\<R\>

```ts
type Question<R> = R extends Rule<any, any, infer Q, any> ? Q : never;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

## Type Parameters

### R

`R`
