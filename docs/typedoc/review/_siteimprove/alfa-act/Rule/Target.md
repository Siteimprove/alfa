# Type Alias: Target\<R\>

```ts
type Target<R> = R extends Rule<any, infer T, any, any> ? T : never;
```

Defined in: [alfa-act/src/rule.ts](https://github.com/Siteimprove/alfa/blob/main/packages/alfa-act/src/rule.ts)

## Type Parameters

### R

`R`
